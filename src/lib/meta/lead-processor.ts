import { supabaseAdmin } from '../supabase/admin';
import { fetchLeadDetails } from './graph-api';
import { cleanSaudiPhone } from '../phone-cleaner';
import { buildNuzulPayload, sendToNuzul } from '../nuzul-sender';

export async function processMetaLead(
  leadgenId: string,
  pageId: string,
  formId: string,
  adId: string,
  createdTime: string,
  rawPayload: Record<string, unknown>
) {
  try {
    // 1. تحقق من عدم التكرار
    const { data: existing } = await supabaseAdmin
      .from('meta_leads')
      .select('id, status')
      .eq('meta_lead_id', leadgenId)
      .limit(1)
      .single();

    if (existing) {
      console.log(`[META] lead_received - Duplicate skipped: ${leadgenId}`);
      return;
    }

    // 2. تسجيل Lead مبدئيًا
    const { data: metaLead, error: insertError } = await supabaseAdmin
      .from('meta_leads')
      .insert([{
        meta_lead_id: leadgenId,
        page_id: pageId,
        form_id: formId,
        ad_id: adId,
        meta_created_time: new Date(Number(createdTime) * 1000).toISOString(),
        raw_payload: rawPayload,
        status: 'processing'
      }])
      .select()
      .single();

    if (insertError || !metaLead) {
      throw new Error(`Failed to insert meta_lead: ${insertError?.message}`);
    }

    // 3. جلب بيانات العميل
    console.log(`[META] fetching_lead lead_id=${leadgenId}`);
    let leadData;
    try {
      leadData = await fetchLeadDetails(leadgenId);
    } catch (err: unknown) {
      const fetchError = err as Error;
      await supabaseAdmin.from('meta_leads').update({
        status: 'failed',
        last_error: fetchError.message,
        attempts: 1
      }).eq('id', metaLead.id);
      console.error(`[META] graph_api_error: ${fetchError.message}`);
      return;
    }

    await supabaseAdmin.from('meta_leads').update({ lead_data: leadData }).eq('id', metaLead.id);

    // 4. استخراج البيانات
    const fieldData = leadData.field_data || [];
    const getField = (name: string) => {
      const field = fieldData.find((f: { name: string, values: string[] }) => f.name === name);
      return field && field.values && field.values.length > 0 ? field.values[0] : '';
    };

    const fullName = getField('full_name');
    const firstName = getField('first_name');
    const lastName = getField('last_name');
    const phoneRaw = getField('phone_number');
    const email = getField('email');

    const finalName = fullName || (firstName && lastName ? `${firstName} ${lastName}` : firstName);
    const phoneCleaned = cleanSaudiPhone(phoneRaw);

    console.log(`[META] lead_normalized lead_id=${leadgenId}`);

    // 5. جلب Form Mapping
    const { data: mapping } = await supabaseAdmin
      .from('meta_form_mappings')
      .select('*')
      .eq('form_id', formId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!mapping) {
      console.log(`[META] unknown_form form_id=${formId}`);
      await supabaseAdmin.from('meta_leads').update({
        status: 'waiting_mapping',
        last_error: `No mapping configured for Meta form: ${formId}`,
        form_mapping_id: null
      }).eq('id', metaLead.id);
      return;
    }

    // 6. الحفظ في جدول leads (للتوافق مع النظام الحالي)
    // مفتاح منع التكرار الخاص بالنظام
    const dedupKey = `meta:${leadgenId}`;

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert([{
        first_name: firstName || finalName,
        last_name: lastName || '',
        full_name: finalName,
        phone_raw: phoneRaw,
        phone_cleaned: phoneCleaned,
        email: email,
        raw_data: leadData,
        sync_status: 'pending',
        dedup_key: dedupKey
      }])
      .select()
      .single();

    if (leadError) {
      if (leadError.code === '23505') {
        // العميل موجود فعلا
        await supabaseAdmin.from('meta_leads').update({
          status: 'failed',
          last_error: 'Duplicate lead in leads table',
          form_mapping_id: mapping.id
        }).eq('id', metaLead.id);
        return;
      }
      throw new Error(`Failed to save to leads table: ${leadError.message}`);
    }

    // ربط meta_leads بالعميل و mapping
    await supabaseAdmin.from('meta_leads').update({
      lead_id: lead.id,
      form_mapping_id: mapping.id
    }).eq('id', metaLead.id);

    console.log(`[META] processing_lead lead_id=${leadgenId}`);

    // 7. تحضير وإرسال إلى Nuzul
    const payload = buildNuzulPayload(
      { full_name: finalName, phone_cleaned: phoneCleaned, email },
      {
        note: mapping.note,
        source: mapping.source || 'Meta',
        property_id: mapping.property_id,
        project_id: mapping.project_id,
        lead_type: mapping.lead_type,
        purpose: mapping.purpose,
        project_model_id: mapping.project_model_id,
        tag_ids: mapping.tag_ids
      }
    );

    const nuzulResponse = await sendToNuzul(payload);
    const actionStatus = nuzulResponse.success ? 'sent' : 'failed';

    // 8. تحديث الحالة
    await supabaseAdmin.from('leads').update({
      sync_status: actionStatus,
      deal_id: nuzulResponse.dealId || null,
      sync_error: nuzulResponse.error || null,
      crm_response: nuzulResponse.rawResponse,
      synced_at: new Date().toISOString()
    }).eq('id', lead.id);

    await supabaseAdmin.from('meta_leads').update({
      status: nuzulResponse.success ? 'synced' : 'failed',
      nuzul_deal_id: nuzulResponse.dealId || null,
      nuzul_response: nuzulResponse.rawResponse,
      last_error: nuzulResponse.error || null,
      processed_at: new Date().toISOString()
    }).eq('id', metaLead.id);

    // 9. تسجيل في Logs (بشكل وهمي بدون sheet_config_id أو بمعرف خاص)
    await supabaseAdmin.from('sync_logs').insert([{
      lead_id: lead.id,
      action: 'meta_sync',
      status: actionStatus,
      request_payload: payload,
      response_code: nuzulResponse.httpCode,
      response_body: nuzulResponse.rawResponse,
      error_message: nuzulResponse.error || null
    }]);

    if (nuzulResponse.success) {
      console.log(`[META] nuzul_success lead_id=${leadgenId} deal_id=${nuzulResponse.dealId}`);
    } else {
      console.log(`[META] nuzul_error lead_id=${leadgenId} error=${nuzulResponse.error}`);
    }

  } catch (error: unknown) {
    const processError = error as Error;
    console.error(`[META] Error processing leadgenId=${leadgenId}:`, processError);
    // حاول تحديث الحالة إلى failed إذا كان ممكنًا
    await supabaseAdmin.from('meta_leads').update({
      status: 'failed',
      last_error: processError.message || 'Unknown error'
    }).eq('meta_lead_id', leadgenId);
  }
}

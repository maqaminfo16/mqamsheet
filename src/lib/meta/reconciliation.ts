import { supabaseAdmin } from '../supabase/admin';
import { processMetaLead } from './lead-processor';

export async function reconcileMetaLeads(formId: string, sinceTimestamp?: number, untilTimestamp?: number, limit = 50) {
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v20.0';

  if (!accessToken) {
    throw new Error('META_PAGE_ACCESS_TOKEN is not configured.');
  }

  // إذا لم يتم توفير وقت، نستخدم آخر 24 ساعة
  const until = untilTimestamp || Math.floor(Date.now() / 1000);
  const since = sinceTimestamp || (until - 24 * 60 * 60);

  const url = `https://graph.facebook.com/${apiVersion}/${formId}/leads?access_token=${accessToken}&since=${since}&until=${until}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Graph API Error: ${data.error?.message || 'Unknown error'}`);
    }

    const leads = data.data || [];
    const results = [];

    for (const lead of leads) {
      const leadgenId = lead.id;
      const createdTime = lead.created_time; // ISO format from this endpoint usually

      // التحقق مما إذا كان موجودًا لدينا
      const { data: existing } = await supabaseAdmin
        .from('meta_leads')
        .select('id, status')
        .eq('meta_lead_id', leadgenId)
        .limit(1)
        .single();

      if (!existing) {
        // مفقود! نحتاج لمعالجته
        console.log(`[META] Reconcile found missing lead: ${leadgenId}`);
        // إنشاء payload وهمي مشابه لما يرسله Webhook
        const rawPayload = {
          entry: [{
            id: "reconcile",
            time: Math.floor(new Date(createdTime).getTime() / 1000),
            changes: [{
              value: {
                form_id: formId,
                leadgen_id: leadgenId,
                created_time: Math.floor(new Date(createdTime).getTime() / 1000),
                page_id: "reconcile"
              }
            }]
          }]
        };

        await processMetaLead(
          leadgenId,
          "reconcile",
          formId,
          "",
          Math.floor(new Date(createdTime).getTime() / 1000).toString(),
          rawPayload
        );
        results.push({ leadgenId, status: 'processed' });
      } else {
        results.push({ leadgenId, status: 'skipped (exists)' });
      }
    }

    return { 
      fetched: leads.length, 
      processed: results.filter(r => r.status === 'processed').length,
      results,
      paging: data.paging 
    };

  } catch (error: unknown) {
    const err = error as Error;
    throw new Error(`Failed to reconcile leads: ${err.message}`);
  }
}

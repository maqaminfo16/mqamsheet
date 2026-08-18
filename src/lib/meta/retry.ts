import { supabaseAdmin } from '../supabase/admin';
import { processMetaLead } from './lead-processor';

export async function retryFailedMetaLeads(limit = 50) {
  // جلب العملاء الفاشلين أو اللي بانتظار mapping (بشرط عدد محاولات أقل من 5)
  const { data: leads, error } = await supabaseAdmin
    .from('meta_leads')
    .select('*')
    .in('status', ['failed', 'waiting_mapping'])
    .lt('attempts', 5)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch leads for retry: ${error.message}`);
  }

  if (!leads || leads.length === 0) {
    return { processed: 0, results: [] };
  }

  const results = [];

  for (const lead of leads) {
    try {
      // زيادة عدد المحاولات
      await supabaseAdmin.from('meta_leads').update({
        attempts: lead.attempts + 1
      }).eq('id', lead.id);

      // إذا لم يكن لديه lead_data بعد، فهذا يعني أنه فشل في مرحلة الجلب أو تم للتو استلامه
      if (!lead.lead_data) {
        // نعيد معالجة من الصفر (نحتاج فقط حذف السجل الوهمي أو السماح للمُعالج بالعمل)
        // لكن processMetaLead يتأكد من `existing`، لذا سنتجاوز ذلك بتعديل مؤقت أو استخدام المنطق الداخلي.
        // بما أن processMetaLead سيوقفه existing, سنقوم بحذفه ومعالجته مجددًا.
        await supabaseAdmin.from('meta_leads').delete().eq('id', lead.id);
        await processMetaLead(
          lead.meta_lead_id,
          lead.page_id,
          lead.form_id,
          lead.ad_id,
          (new Date(lead.meta_created_time).getTime() / 1000).toString(),
          lead.raw_payload
        );
      } else {
        // لديه بيانات (إذن إما failed في مرحلة Nuzul أو waiting_mapping)
        // نظرًا لأن المنطق معقد قليلاً للفصل، الطريقة الأسهل هي إعادة توجيهه لـ processMetaLead
        // بعد مسح السجل القديم
        await supabaseAdmin.from('meta_leads').delete().eq('id', lead.id);
        
        // احذف من leads إذا كان موجودًا لكي لا يحدث تعارض dedup
        if (lead.lead_id) {
            await supabaseAdmin.from('leads').delete().eq('id', lead.lead_id);
        }

        await processMetaLead(
          lead.meta_lead_id,
          lead.page_id,
          lead.form_id,
          lead.ad_id,
          (new Date(lead.meta_created_time).getTime() / 1000).toString(),
          lead.raw_payload
        );
      }
      
      results.push({ meta_lead_id: lead.meta_lead_id, status: 'retried' });
    } catch (e: unknown) {
      const err = e as Error;
      results.push({ meta_lead_id: lead.meta_lead_id, status: 'error', error: err.message });
    }
  }

  return { processed: leads.length, results };
}

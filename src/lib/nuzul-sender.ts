interface NuzulPayload {
  name: string;
  mobile_number: string;
  email?: string;
  note?: string;
  source?: string;
  property_id?: number;
  project_id?: number;
  type?: string;
  purpose?: string;
  t_project_model_id?: string;
  tag_ids?: number[];
}

interface NuzulResponse {
  success: boolean;
  dealId?: string;
  httpCode: number;
  rawResponse: any;
  error?: string;
}

interface SheetConfig {
  note?: string | null;
  source?: string | null;
  property_id?: number | null;
  project_id?: number | null;
  lead_type?: string | null;
  purpose?: string | null;
  project_model_id?: string | null;
  tag_ids?: number[] | null;
}

interface LeadData {
  full_name: string;
  phone_cleaned: string;
  email?: string | null;
}

export function buildNuzulPayload(lead: LeadData, config: SheetConfig): NuzulPayload {
  const payload: NuzulPayload = {
    name: lead.full_name,
    mobile_number: lead.phone_cleaned,
  };

  if (lead.email) {
    const emailStr = lead.email.trim().toLowerCase();
    // Only send the email if it's a valid string and contains '@'
    if (emailStr !== 'null' && emailStr !== 'undefined' && emailStr !== '-' && emailStr.includes('@')) {
      payload.email = lead.email.trim();
    }
  }
  if (config.note) payload.note = config.note;
  if (config.source) payload.source = config.source;

  if (config.project_id) {
    // تدفق المشروع
    payload.project_id = config.project_id;
    if (config.lead_type) payload.type = config.lead_type;
    if (config.purpose) payload.purpose = config.purpose;
    if (config.project_model_id) payload.t_project_model_id = config.project_model_id;
    if (config.property_id) payload.property_id = config.property_id;
  } else if (config.property_id) {
    // تدفق العقار
    payload.property_id = config.property_id;
  }

  if (config.tag_ids && config.tag_ids.length > 0) {
    payload.tag_ids = config.tag_ids;
  }

  return payload;
}

export async function sendToNuzul(payload: NuzulPayload): Promise<NuzulResponse> {
  const baseUrl = (process.env.NUZUL_API_BASE_URL || 'https://maqamco.nzl-backend.com').replace(/\/+$/, '');
  const url = `${baseUrl}/api/public/deals`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // إضافة API Token إذا متوفر
  const token = process.env.NUZUL_API_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const textBody = await response.text();
    let body;
    try {
      body = JSON.parse(textBody);
    } catch {
      body = textBody;
    }

    if (response.ok) {
      const dealId = body?.data?.id || '';
      return {
        success: true,
        dealId: String(dealId),
        httpCode: response.status,
        rawResponse: body,
      };
    } else {
      return {
        success: false,
        httpCode: response.status,
        rawResponse: body,
        error: `HTTP ${response.status}: ${JSON.stringify(body)}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      httpCode: 0,
      rawResponse: null,
      error: err.message || 'Network error',
    };
  }
}

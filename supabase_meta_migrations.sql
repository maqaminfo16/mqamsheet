-- جدول meta_form_mappings
CREATE TABLE meta_form_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id TEXT NOT NULL UNIQUE,
  form_name TEXT,
  project_id INTEGER,
  property_id INTEGER,
  tag_ids INTEGER[] DEFAULT '{}',
  lead_type TEXT,
  purpose TEXT,
  project_model_id TEXT,
  source TEXT DEFAULT 'Meta',
  note TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء دالة تحديث updated_at للـ Trigger
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- ربط Trigger بجدول meta_form_mappings
CREATE TRIGGER set_meta_form_mappings_updated_at
BEFORE UPDATE ON meta_form_mappings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_column();


-- جدول meta_leads
CREATE TABLE meta_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_lead_id TEXT NOT NULL UNIQUE,
  page_id TEXT,
  form_id TEXT,
  ad_id TEXT,
  meta_created_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'processing', 'synced', 'failed', 'waiting_mapping', 'recovered')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  raw_payload JSONB,
  lead_data JSONB,
  nuzul_deal_id TEXT,
  nuzul_response JSONB,
  -- ملاحظة: تأكد من نوع حقل id في جدول leads. إذا كان نوعه INTEGER غيّر السطر التالي.
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  form_mapping_id UUID REFERENCES meta_form_mappings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_meta_leads_status ON meta_leads(status);
CREATE INDEX idx_meta_leads_form_id ON meta_leads(form_id);

-- ربط Trigger بجدول meta_leads
CREATE TRIGGER set_meta_leads_updated_at
BEFORE UPDATE ON meta_leads
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_column();

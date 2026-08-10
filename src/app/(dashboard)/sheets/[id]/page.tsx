'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { LeadsTable } from '@/components/LeadsTable'
import { ArrowRight, Trash2, Edit, Code } from 'lucide-react'

export default function SheetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [config, setConfig] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [scriptModalOpen, setScriptModalOpen] = useState(false)
  const [scriptCode, setScriptCode] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const fetchData = async () => {
    try {
      const [detailsRes, leadsRes] = await Promise.all([
        fetch(`/api/sheets/${id}`),
        fetch(`/api/leads?sheet_config_id=${id}`)
      ])
      if (detailsRes.ok) {
        const { data } = await detailsRes.json()
        setConfig(data.config)
        setStats(data.stats)
      }
      if (leadsRes.ok) {
        const { data } = await leadsRes.json()
        setLeads(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const toggleAutoSync = async (checked: boolean) => {
    setConfig({ ...config, auto_sync: checked })
    await fetch(`/api/sheets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto_sync: checked })
    })
  }

  const handleDelete = async () => {
    await fetch(`/api/sheets/${id}`, { method: 'DELETE' })
    router.push('/sheets')
  }

  const fetchScript = async () => {
    const res = await fetch(`/api/sheets/${id}/script`)
    if (res.ok) {
      const { script } = await res.json()
      setScriptCode(script)
      setScriptModalOpen(true)
    }
  }

  if (loading) return <div>جاري التحميل...</div>
  if (!config) return <div>الملف غير موجود</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Button variant="ghost" onClick={() => router.push('/sheets')}>
          <ArrowRight size={20} />
        </Button>
        <Header title={config.name} />
        <Badge variant={config.is_active ? 'success' : 'danger'}>
          {config.is_active ? 'نشط' : 'متوقف'}
        </Badge>
        {config.auto_sync && <Badge variant="info">مزامنة تلقائية</Badge>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card title="ملخص الإعدادات">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            <div><strong>المصدر:</strong> {config.source || '-'}</div>
            <div><strong>معرّف المشروع:</strong> {config.project_id || '-'}</div>
            <div><strong>نوع العقار:</strong> {config.lead_type || '-'}</div>
            <div><strong>الغرض:</strong> {config.purpose || '-'}</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* <Button variant="secondary" onClick={() => router.push(`/sheets/${id}/edit`)}>
              <Edit size={16} /> تعديل
            </Button> */}
            <Button variant="secondary" onClick={fetchScript}>
              <Code size={16} /> كود Apps Script
            </Button>
            <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 size={16} /> حذف
            </Button>
          </div>
        </Card>

        <Card title="التحكم بالمزامنة">
          <div style={{ marginBottom: '1rem' }}>
            <Toggle 
              label="المزامنة التلقائية" 
              description="عند التفعيل، سيتم إرسال كل عميل جديد فوراً لـ Maqam CRM"
              checked={config.auto_sync}
              onChange={toggleAutoSync}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
            <div>إجمالي: <strong>{stats?.total}</strong></div>
            <div style={{ color: 'var(--success)' }}>مُرسل: <strong>{stats?.sent}</strong></div>
            <div style={{ color: 'var(--danger)' }}>فشل: <strong>{stats?.failed}</strong></div>
            <div style={{ color: 'var(--warning)' }}>انتظار: <strong>{stats?.pending}</strong></div>
          </div>
        </Card>
      </div>

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>العملاء</h2>
        <Card>
          <LeadsTable 
            leads={leads} 
            loading={loading} 
            onSync={async (leadId) => {
              setLoading(true);
              await fetch('/api/leads/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_ids: [leadId] })
              });
              await fetchData();
            }}
            onSyncAll={async () => {
              setLoading(true);
              await fetch('/api/leads/sync-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sheet_config_id: id })
              });
              await fetchData();
            }}
          />
        </Card>
      </div>

      <Modal isOpen={scriptModalOpen} onClose={() => setScriptModalOpen(false)} title="كود Apps Script">
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          انسخ هذا الكود والصقه في محرر Apps Script الخاص بملف Google Sheet.
        </p>
        <CodeBlock code={scriptCode} language="javascript" />
      </Modal>

      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        title="تأكيد الحذف"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>إلغاء</Button>
            <Button variant="danger" onClick={handleDelete}>نعم، احذف الملف</Button>
          </>
        }
      >
        <p>هل أنت متأكد من حذف الملف "{config.name}"؟ سيتم حذف جميع بيانات العملاء المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.</p>
      </Modal>
    </div>
  )
}

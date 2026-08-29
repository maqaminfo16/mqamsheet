'use client'

import { useEffect, useState, useCallback } from 'react'
import { Header } from '@/components/Header'
import { StatsCards } from '@/components/StatsCards'
import { LeadsTable } from '@/components/LeadsTable'
import { Card } from '@/components/ui/Card'
import { FileSpreadsheet, Users, CheckCircle, XCircle } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({ sheets: 0, leads: 0, sent: 0, failed: 0 })
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [sheetsRes, leadsRes] = await Promise.all([
        fetch('/api/sheets'),
        fetch('/api/leads?limit=1000')
      ])

      if (sheetsRes.ok) {
        const { data } = await sheetsRes.json()
        let totalLeads = 0
        let totalSent = 0
        let totalFailed = 0
        
        data.forEach((s: any) => {
          totalLeads += s.total_leads || 0
          totalSent += s.sent_leads || 0
          totalFailed += s.failed_leads || 0
        })

        setStats({
          sheets: data.length,
          leads: totalLeads,
          sent: totalSent,
          failed: totalFailed
        })
      }

      if (leadsRes.ok) {
        const { data } = await leadsRes.json()
        setRecentLeads(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSync = async (leadId: string) => {
    setLoading(true)
    try {
      await fetch('/api/leads/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: [leadId] })
      })
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncAll = async () => {
    setLoading(true)
    try {
      await fetch('/api/leads/sync-all', {
        method: 'POST'
      })
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'إجمالي الملفات', value: stats.sheets, icon: <FileSpreadsheet size={24} />, color: 'var(--info)' },
    { title: 'إجمالي العملاء', value: stats.leads, icon: <Users size={24} />, color: 'var(--accent-primary)' },
    { title: 'مُرسل بنجاح', value: stats.sent, icon: <CheckCircle size={24} />, color: 'var(--success)' },
    { title: 'فشل الإرسال', value: stats.failed, icon: <XCircle size={24} />, color: 'var(--danger)' },
  ]

  return (
    <div className="gap-sm-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Header title="لوحة التحكم" />
      
      <StatsCards stats={statCards} loading={loading} />

      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          آخر العملاء المضافين
        </h2>
        <Card>
          <LeadsTable 
            leads={recentLeads} 
            loading={loading} 
            onSync={handleSync}
            onSyncAll={handleSyncAll}
          />
        </Card>
      </div>
    </div>
  )
}

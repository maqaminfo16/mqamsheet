'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { SheetCard } from '@/components/SheetCard'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function SheetsPage() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const res = await fetch('/api/sheets')
        if (res.ok) {
          const { data } = await res.json()
          setSheets(data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSheets()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Header title="ملفات الشيت" />
        <Button variant="primary" onClick={() => router.push('/sheets/new')}>
          <Plus size={18} />
          إضافة ملف جديد
        </Button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>جاري التحميل...</div>
      ) : sheets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          لا توجد ملفات حالياً. أضف ملفاً جديداً لتبدأ.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {sheets.map((sheet: any) => (
            <SheetCard key={sheet.id} sheet={sheet} />
          ))}
        </div>
      )}
    </div>
  )
}

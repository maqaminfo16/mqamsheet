'use client'

import { Header } from '@/components/Header'
import { SheetForm } from '@/components/SheetForm'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

export default function NewSheetPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const resData = await res.json()
    
    if (!res.ok) throw new Error(resData.error)
    
    const scriptRes = await fetch(`/api/sheets/${resData.data.id}/script`)
    const scriptData = await scriptRes.json()
    return { script: scriptData.script, id: resData.data.id }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowRight size={20} />
        </Button>
        <Header title="إضافة ملف جديد" />
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <SheetForm onSubmit={handleSubmit} onFinish={() => router.push('/sheets')} />
      </div>
    </div>
  )
}

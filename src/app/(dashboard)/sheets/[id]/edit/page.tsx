'use client'

import { Header } from '@/components/Header'
import { SheetForm } from '@/components/SheetForm'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState, use } from 'react'

export default function EditSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSheet = async () => {
      try {
        const res = await fetch(`/api/sheets/${id}`)
        if (res.ok) {
          const { data } = await res.json()
          setInitialData(data.config)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSheet()
  }, [id])

  const handleSubmit = async (data: any) => {
    const res = await fetch(`/api/sheets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const resData = await res.json()
    
    if (!res.ok) throw new Error(resData.error)
    
    // We fetch the script again in case they changed column names
    const scriptRes = await fetch(`/api/sheets/${id}/script`)
    const scriptData = await scriptRes.json()
    return { script: scriptData.script, id }
  }

  if (loading) return <div>جاري التحميل...</div>
  if (!initialData) return <div>لم يتم العثور على الملف</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowRight size={20} />
        </Button>
        <Header title="تعديل إعدادات الملف" />
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <SheetForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          onFinish={() => router.push(`/sheets/${id}`)} 
        />
      </div>
    </div>
  )
}

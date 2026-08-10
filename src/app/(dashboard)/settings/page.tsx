'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('https://maqamco.nzl-backend.com')
  const [apiToken, setApiToken] = useState('********') // Fake display
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    // Since we can't easily change process.env at runtime on Vercel without redeploying,
    // we would show a message explaining how to update it via Vercel dashboard.
    // Or save it to a database if implemented. 
    setTimeout(() => {
      setMessage('لتطبيق الإعدادات، يرجى تحديث متغيرات البيئة NUZUL_API_BASE_URL و NUZUL_API_TOKEN في لوحة تحكم Vercel وإعادة النشر.')
      setLoading(false)
    }, 1000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Header title="الإعدادات" />
      
      <div style={{ maxWidth: '600px' }}>
        <Card title="إعدادات Maqam CRM">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
            <Input
              label="رابط API الأساسي"
              value={apiUrl}
              onChange={(e: any) => setApiUrl(e.target.value)}
              disabled
              hint="مخزن في متغيرات البيئة: NUZUL_API_BASE_URL"
            />
            <Input
              label="API Token"
              type="password"
              value={apiToken}
              onChange={(e: any) => setApiToken(e.target.value)}
              disabled
              hint="مخزن في متغيرات البيئة: NUZUL_API_TOKEN"
            />

            {message && (
              <div style={{ padding: '1rem', background: 'rgba(10, 59, 84, 0.1)', color: 'var(--accent-primary)', borderRadius: '8px', fontSize: '0.875rem' }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button type="submit" variant="primary" loading={loading}>
                حفظ الإعدادات
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

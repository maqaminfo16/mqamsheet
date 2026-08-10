'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push('/')
      } else {
        const data = await res.json()
        setError(data.error || 'فشل تسجيل الدخول')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-in-up">
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Maqam</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>تسجيل الدخول للوحة التحكم</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="اسم المستخدم"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
            />
            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            
            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

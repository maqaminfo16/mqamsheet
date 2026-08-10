import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const success = await login(username, password)
    
    if (success) {
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json(
      { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ داخلي' },
      { status: 500 }
    )
  }
}

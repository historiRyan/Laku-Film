import { NextResponse } from 'next/server'
import { verifyJwt, COOKIE_NAME } from '@/lib/jwt'

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))?.[1]

  if (!token) {
    return NextResponse.json({ user: null })
  }

  const payload = await verifyJwt(token)
  if (!payload) {
    const res = NextResponse.json({ user: null })
    res.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return res
  }

  return NextResponse.json({
    user: { name: payload.name, username: payload.username, role: payload.role },
  })
}

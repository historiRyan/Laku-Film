import { NextResponse } from 'next/server'
import { signJwt, getCookieOptions } from '@/lib/jwt'
import { readUsers, writeUsers } from '@/lib/users'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: 'Username dan kata sandi wajib diisi.' },
        { status: 400 }
      )
    }

    const users = readUsers()
    const match = users.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password
    )

    if (!match) {
      return NextResponse.json(
        { ok: false, error: 'Username atau kata sandi salah.' },
        { status: 401 }
      )
    }

    const token = await signJwt({
      username: match.username,
      name: match.name,
      role: match.role,
    })

    const user = { name: match.name, username: match.username, role: match.role }

    const res = NextResponse.json({ ok: true, user })
    res.cookies.set('auth-token', token, getCookieOptions())

    return res
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Terjadi kesalahan.' },
      { status: 500 }
    )
  }
}

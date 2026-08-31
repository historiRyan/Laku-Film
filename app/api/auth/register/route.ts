import { NextResponse } from "next/server"
import { signJwt, getCookieOptions, COOKIE_NAME } from "@/lib/jwt"
import { readUsers, writeUsers, type StoredUser } from "@/lib/users"
import { hashPassword } from "@/lib/password"

export async function POST(request: Request) {
  try {
    const { name, username, password, role, autoLogin = true } = await request.json()

    const normalizedUsername = username.trim().toLowerCase()
    if (!name.trim() || !normalizedUsername || !password) {
      return NextResponse.json(
        { ok: false, error: "Semua kolom wajib diisi." },
        { status: 400 },
      )
    }

    const users = readUsers()
    if (users.some((u) => u.username === normalizedUsername)) {
      return NextResponse.json(
        { ok: false, error: "Username sudah terdaftar. Silakan masuk." },
        { status: 409 },
      )
    }

    const hashedPassword = await hashPassword(password)
    const newUser: StoredUser = {
      name: name.trim(),
      username: normalizedUsername,
      password: hashedPassword,
      role: role ?? "user",
    }

    writeUsers([...users, newUser])

    const user = { name: newUser.name ?? newUser.username, username: newUser.username, role: newUser.role }

    const res = NextResponse.json({ ok: true, user })

    if (autoLogin) {
      const token = await signJwt({
        username: newUser.username,
        name: newUser.name ?? newUser.username,
        role: newUser.role,
      })
      res.cookies.set(COOKIE_NAME, token, getCookieOptions())
    }

    return res
  } catch {
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan." },
      { status: 500 },
    )
  }
}

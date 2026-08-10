"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

export type User = {
  name: string
  username: string
  role?: string
}

type StoredUser = {
  username: string
  password: string
  role: string
  name: string
}

type AuthResult = {
  ok: boolean
  error?: string
  role?: string
}

type AuthContextValue = {
  user: User | null
  ready: boolean
  register: (name: string, username: string, password: string) => Promise<AuthResult>
  registerAdmin: (name: string, username: string, password: string) => Promise<AuthResult>
  login: (username: string, password: string) => Promise<AuthResult>
  logout: () => void
}

const USERS_KEY = "lakufilm.users"
const SESSION_KEY = "lakufilm.session"

const AuthContext = createContext<AuthContextValue | null>(null)

async function readUsers(): Promise<StoredUser[]> {
  try {
    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'read',
        filePath: 'lib/users.json'
      })
    })
    const { success, data } = await res.json()
    return success ? JSON.parse(data).users : []
  } catch {
    return []
  }
}

async function writeUsers(users: StoredUser[]) {
  try {
    await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'write',
        filePath: 'lib/users.json',
        data: { users }
      })
    })
  } catch (error) {
    console.error("Gagal menyimpan data pengguna:", error)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      if (session) setUser(JSON.parse(session) as User)
    } catch {
      // ignore
    }
    setReady(true)
  }, [])

  const register = useCallback(async (name: string, username: string, password: string) => {
    const normalizedUsername = username.trim().toLowerCase()
    if (!name.trim() || !normalizedUsername || !password) {
      return { ok: false, error: "Semua kolom wajib diisi." }
    }
    const users = await readUsers()
    if (users.some((u: StoredUser) => u.username === normalizedUsername)) {
      return { ok: false, error: "Username sudah terdaftar. Silakan masuk." }
    }
    const newUser: StoredUser = { name: name.trim(), username: normalizedUsername, password, role: "user" }
    await writeUsers([...users, newUser])
    const session: User = { name: newUser.name, username: newUser.username }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }, [])

  const registerAdmin = useCallback(async (name: string, username: string, password: string) => {
    const normalizedUsername = username.trim().toLowerCase()
    if (!name.trim() || !normalizedUsername || !password) {
      return { ok: false, error: "Semua kolom wajib diisi." }
    }
    const users = await readUsers()
    if (users.some((u: StoredUser) => u.username === normalizedUsername)) {
      return { ok: false, error: "Username sudah terdaftar. Silakan masuk." }
    }
    const newUser: StoredUser = { name: name.trim(), username: normalizedUsername, password, role: "admin" }
    await writeUsers([...users, newUser])
    return { ok: true, role: "admin" }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const users = await readUsers()
    const match = users.find((u: StoredUser) => u.username === username && u.password === password)
    if (!match) {
      return { ok: false, error: "Username atau kata sandi salah." }
    }
    const session: User = { name: match.name, username: match.username, role: match.role }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { 
      ok: true,
      role: match.role
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, register, registerAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider")
  return ctx
}

"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

export type User = {
  name: string
  username: string
  role?: string
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

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchMe(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    })
    if (!res.ok) return null
    const { user } = await res.json()
    return user ?? null
  } catch {
    return null
  }
}

async function authRequest(
  url: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; error?: string; user?: User }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!data.ok) {
    return { ok: false, error: data.error ?? "Terjadi kesalahan." }
  }
  return { ok: true, user: data.user }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetchMe().then((u) => {
      setUser(u)
      setReady(true)
    })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const result = await authRequest("/api/auth/login", { username, password })
    if (!result.ok) return { ok: false, error: result.error }
    if (result.user) setUser(result.user)
    return { ok: true, role: result.user?.role }
  }, [])

  const register = useCallback(async (name: string, username: string, password: string) => {
    const result = await authRequest("/api/auth/register", {
      name,
      username,
      password,
      role: "user",
      autoLogin: true,
    })
    if (!result.ok) return { ok: false, error: result.error }
    if (result.user) setUser(result.user)
    return { ok: true }
  }, [])

  const registerAdmin = useCallback(async (name: string, username: string, password: string) => {
    const result = await authRequest("/api/auth/register", {
      name,
      username,
      password,
      role: "admin",
      autoLogin: false,
    })
    if (!result.ok) return { ok: false, error: result.error }
    return { ok: true, role: "admin" }
  }, [])

  const logout = useCallback(() => {
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {})
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

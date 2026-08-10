"use client"

import { type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/components/auth-provider"
import { SiteHeader } from "@/components/site-header"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) {
      const callbackUrl = window.location.pathname + window.location.search
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
  }, [ready, user, router])

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-4 py-16">
          <p className="text-muted-foreground">Memuat...</p>
        </main>
      </div>
    )
  }

  return <>{children}</>
}

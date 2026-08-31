"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bookmark } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { AuthGuard } from "@/components/auth-guard"
import { SiteHeader } from "@/components/site-header"
import { MovieCard } from "@/components/movie-card"
import type { Film } from "@/lib/types"

function WatchlistContent() {
  const { user } = useAuth()
  const [items, setItems] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch("/api/watchlist", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Bookmark className="size-6 text-primary" /> Watchlist saya
      </h1>

      {loading ? (
        <p className="text-muted-foreground">Memuat…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">Watchlist kamu masih kosong.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Klik ikon <Bookmark className="inline size-4" /> pada film untuk menyimpannya di sini.
          </p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            Jelajahi film →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((film) => (
            <MovieCard key={film.id} movie={film} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function WatchlistPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <WatchlistContent />
      </div>
    </AuthGuard>
  )
}

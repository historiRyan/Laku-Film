"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Film, Play, Pencil, Trash2, Star, Search, X, ChevronLeft, ChevronRight } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LocalFilm } from "@/lib/types"
import { cn } from "@/lib/utils"

async function fetchFilms(): Promise<LocalFilm[]> {
  try {
    const res = await fetch("/api/films")
    if (!res.ok) return []
    const data = await res.json()
    return (data.films || []) as LocalFilm[]
  } catch {
    return []
  }
}

export default function MyFilmsPage() {
  const router = useRouter()
  const { user, ready } = useAuth()
  const [films, setFilms] = useState<LocalFilm[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (ready && !user) router.replace("/login")
  }, [ready, user, router])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const all = await fetchFilms()
      setFilms(all.filter((f) => f.owner === user.username))
      setLoaded(true)
    })()
  }, [user])

  useEffect(() => {
    setPage(1)
  }, [search])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return films
    return films.filter(
      (f) =>
        f.title.toLowerCase().includes(needle) ||
        (f.genres ?? []).some((g) => g.toLowerCase().includes(needle)) ||
        f.description?.toLowerCase().includes(needle),
    )
  }, [films, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const current = Math.min(page, totalPages)
  const paged = useMemo(
    () => filtered.slice((current - 1) * itemsPerPage, current * itemsPerPage),
    [filtered, current],
  )

  async function handleDelete(film: LocalFilm) {
    if (
      !confirm(
        `Hapus "${film.title}"? Berkas video dan thumbnail akan dihapus dari perangkat ini.`,
      )
    ) {
      return
    }
    await fetch(`/api/films/${film.id}`, { method: "DELETE" })
    setFilms((prev) => prev.filter((f) => f.id !== film.id))
  }

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-muted-foreground">Memuat...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight">Film Saya</h1>
            <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
              Halo, {user.name}. Kelola film yang sudah Anda unggah di sini.
            </p>
          </div>
          <Link
            href="/upload"
            className={cn(buttonVariants(), "flex items-center gap-2")}
          >
            <Plus className="size-4" />
            Unggah Film
          </Link>
        </div>

        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari film..."
            className="pl-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Hapus pencarian"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {loaded && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Film className="size-7 text-muted-foreground" />
            </span>
            <div>
              <p className="font-medium">
                {search ? "Film tidak ditemukan." : "Belum ada film"}
              </p>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Coba kata kunci lain."
                  : "Mulai dengan mengunggah film pertama Anda."}
              </p>
            </div>
            {!search && (
              <Link
                href="/upload"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "flex items-center gap-2",
                )}
              >
                <Plus className="size-4" />
                Unggah Film
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border max-h-[560px]">
              <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="sticky top-0 bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">Film</th>
                  <th className="px-3 py-2 text-left font-medium">Rating</th>
                  <th className="px-3 py-2 text-left font-medium">Genre</th>
                  <th className="px-3 py-2 text-left font-medium">Diunggah</th>
                  <th className="px-3 py-2 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((film) => (
                  <tr
                    key={film.id}
                    className="border-t border-border align-top"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {film.thumbFileName ? (
                          <img
                            src={`/uploads/${film.thumbFileName}`}
                            alt={film.title}
                            className="size-12 shrink-0 rounded object-cover bg-muted"
                            loading="lazy"
                          />
                        ) : (
                          <span className="flex size-12 shrink-0 items-center justify-center rounded bg-muted">
                            <Film className="size-6 text-muted-foreground" />
                          </span>
                        )}
                        <span className="font-medium">{film.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      {film.rating && film.rating > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                          <Star className="size-3 fill-current" />
                          {film.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 align-top">
                      {film.genres && film.genres.length > 0
                        ? film.genres.join(", ")
                        : "—"}
                    </td>
                    <td className="px-3 py-3 align-top text-muted-foreground">
                      {new Date(film.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                      <td className="px-3 py-3 align-top">
                      <div className="flex justify-center gap-1">
                        <Link
                          href={`/play/${film.id}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "flex items-center justify-center",
                          )}
                          aria-label={`Putar ${film.title}`}
                        >
                          <Play className="size-4" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Edit ${film.title}`}
                          onClick={() => router.push(`/upload?edit=${film.id}`)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Hapus ${film.title}`}
                          onClick={() => handleDelete(film)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Halaman {current} dari {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === 1}
                  aria-label="Halaman sebelumnya"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={current === totalPages}
                  aria-label="Halaman berikutnya"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </main>
    </div>
  )
}

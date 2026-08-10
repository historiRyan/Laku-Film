"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Film, Tv, Search, X, Pencil, Trash2 } from "lucide-react"

import Link from "next/link"
import { MovieCard } from "@/components/movie-card"
import { SeriesCard } from "@/components/series-card"
import { useAuth } from "@/components/auth-provider"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Film as FilmType, Series } from "@/lib/types"

type HomeBrowserProps = {
  movies: FilmType[]
  series: Series[]
  defaultTab: "movie" | "series"
}

export function HomeBrowser({ movies, series, defaultTab }: HomeBrowserProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [tab, setTab] = useState<"movie" | "series">(defaultTab)
  const [localSearch, setLocalSearch] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  useEffect(() => {
    setTab(defaultTab)
  }, [defaultTab])

  const allGenres = useMemo(() => {
    return Array.from(
      new Set([
        ...movies.flatMap((m) => m.genres ?? []),
        ...series.flatMap((s) => s.genres ?? []),
      ]),
    ).sort()
  }, [movies, series])

  function switchTab(next: "movie" | "series") {
    setTab(next)
    setLocalSearch("")
    setSelectedGenre(null)
    setSelectedLetter(null)
    router.replace(`/?tab=${next}`, { scroll: false })
  }

  const searchTerm = localSearch.trim().toLowerCase()
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  const filteredMovies = useMemo(
    () =>
      movies.filter((m) => {
        const matchesSearch =
          !searchTerm ||
          m.title.toLowerCase().includes(searchTerm) ||
          (m.genres ?? []).some((g) => g.toLowerCase().includes(searchTerm))
        const matchesGenre =
          !selectedGenre || (m.genres ?? []).some((g) => g === selectedGenre)
        const matchesLetter =
          !selectedLetter ||
          m.title.toLowerCase().startsWith(selectedLetter.toLowerCase())
        return matchesSearch && matchesGenre && matchesLetter
      }),
    [movies, searchTerm, selectedGenre, selectedLetter],
  )

  const filteredSeries = useMemo(
    () =>
      series.filter((s) => {
        const matchesSearch =
          !searchTerm ||
          s.title.toLowerCase().includes(searchTerm) ||
          (s.genres ?? []).some((g) => g.toLowerCase().includes(searchTerm))
        const matchesGenre =
          !selectedGenre || (s.genres ?? []).some((g) => g === selectedGenre)
        const matchesLetter =
          !selectedLetter ||
          s.title.toLowerCase().startsWith(selectedLetter.toLowerCase())
        return matchesSearch && matchesGenre && matchesLetter
      }),
    [series, searchTerm, selectedGenre, selectedLetter],
  )

  const tabs = [
    { id: "movie" as const, label: "Film", icon: Film, count: filteredMovies.length },
    { id: "series" as const, label: "Series", icon: Tv, count: filteredSeries.length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
          >
            <t.icon className="size-4" />
            <span>{t.label}</span>
            <span
              className={cn(
                "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-xs font-semibold",
                tab === t.id
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="relative max-w-xl">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari film atau series..."
              aria-label="Cari"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch("")}
                aria-label="Hapus pencarian"
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {allGenres.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {allGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() =>
                  setSelectedGenre(selectedGenre === genre ? null : genre)
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  selectedGenre === genre
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {genre}
              </button>
            ))}
            {selectedGenre && (
              <button
                type="button"
                onClick={() => setSelectedGenre(null)}
                className="rounded-full px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                aria-label="Hapus filter genre"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedLetter(null)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium",
              !selectedLetter
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            Semua
          </button>
          {LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() =>
                setSelectedLetter(selectedLetter === letter ? null : letter)
              }
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium",
                selectedLetter === letter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {letter}
            </button>
          ))}
          {selectedLetter && (
            <button
              type="button"
              onClick={() => setSelectedLetter(null)}
              className="rounded-lg px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Hapus filter huruf"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {tab === "movie" ? (
        <>
          {filteredMovies.length === 0 ? (
            <p className="text-muted-foreground">
              {movies.length === 0
                ? "Belum ada film yang bisa ditampilkan."
                : "Tidak ada film yang cocok dengan pencarian Anda."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredMovies.map((movie) => (
                <MovieCard key={`m-${movie.id}`} movie={movie} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {filteredSeries.length === 0 ? (
            series.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-muted">
                  <Tv className="size-7 text-muted-foreground" />
                </span>
                <div>
                  <p className="font-medium">Belum ada series.</p>
                  <p className="text-sm text-muted-foreground">
                    {user
                      ? "Mulai dengan mengunggah series pertama Anda."
                      : "Masuk untuk mengelola series."}
                  </p>
                </div>
                {user && (
                  <Link
                    href="/upload-series"
                    className={cn(buttonVariants())}
                  >
                    + Unggah Series
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Tidak ada series yang cocok dengan pencarian Anda.
              </p>
            )
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSeries.map((s) => (
                <SeriesCard
                  key={`s-${s.id}`}
                  series={s}
                  actions={
                    user && s.owner === user.username ? (
                      <>
                        <Link
                          href={`/upload-series?edit=${s.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            buttonVariants({ variant: "secondary", size: "sm" }),
                            "h-7 w-7 rounded-full p-0",
                          )}
                          aria-label={`Edit ${s.title}`}
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (
                              !confirm(
                                `Hapus series "${s.title}"? Semua episode akan dihapus.`,
                              )
                            )
                              return
                            await fetch(`/api/series/${s.id}`, { method: "DELETE" })
                            router.replace("/?tab=series", { scroll: false })
                          }}
                          className={cn(
                            buttonVariants({ variant: "destructive", size: "sm" }),
                            "h-7 w-7 rounded-full p-0",
                          )}
                          aria-label={`Hapus ${s.title}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </>
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

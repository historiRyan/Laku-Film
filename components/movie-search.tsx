"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Search, Loader2, X } from "lucide-react"

type SearchResult = {
  id: string
  title: string
  year: number
  poster: string
  type: "film" | "series"
}

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json() as Promise<{ results: SearchResult[] }>)

export function MovieSearch() {
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")

  function handleChange(value: string) {
    setQuery(value)
    window.clearTimeout((handleChange as any)._t)
    ;(handleChange as any)._t = window.setTimeout(() => setDebounced(value.trim()), 400)
  }

  const shouldSearch = debounced.length >= 2
  const { data, isLoading } = useSWR(
    shouldSearch ? `/api/search?q=${encodeURIComponent(debounced)}` : null,
    fetcher,
  )

  const results = data?.results ?? []

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Cari film atau series..."
          aria-label="Cari film atau series"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {isLoading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
        {query && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setDebounced("")
            }}
            aria-label="Hapus pencarian"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {shouldSearch && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          {results.length === 0 && !isLoading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Tidak ada film atau series yang cocok.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <Link
                    href={r.type === "series" ? `/series/${r.id}` : `/play/${r.id}`}
                    className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      setQuery("")
                      setDebounced("")
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.poster || "/placeholder.svg"}
                      alt=""
                      className="h-14 w-10 shrink-0 rounded object-cover bg-muted"
                      loading="lazy"
                    />
                    <span className="flex flex-col">
                      <span className="text-sm font-medium leading-tight">
                        {r.title}
                        {r.type === "series" && (
                          <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                            Series
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.year}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

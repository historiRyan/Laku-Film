import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Play, Star, Tv, ExternalLink } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { AuthGuard } from "@/components/auth-guard"
import { getSeries } from "@/lib/data-video"
import type { Episode, Series } from "@/lib/types"
import { EpisodeActions, SeriesManageButton } from "@/components/series-actions"

export const revalidate = 3600

export default async function SeriesEpisodesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const series = getSeries(id)

  if (!series) {
    notFound()
  }

  const poster = series.thumbFileName ? `/uploads/${series.thumbFileName}` : "/placeholder.svg"

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali ke beranda
        </Link>

        <Link
          href="/?tab=series"
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Lihat semua series <ExternalLink className="size-3" />
        </Link>

        <div className="grid gap-8 sm:grid-cols-[minmax(0,200px)_1fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt={`Thumbnail series ${series.title}`}
              className="aspect-[2/3] h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Tv className="size-3.5" />
                <span>Series</span>
              </div>
              <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight">
                {series.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(series.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                {series.episodes.length} episode
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {series.rating && series.rating > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                  <Star className="size-4 fill-current" />
                  {series.rating.toFixed(1)}
                </span>
              )}
              {series.genres &&
                series.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                  >
                    {genre}
                  </span>
                ))}
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Sinopsis</h2>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                {series.description || "Deskripsi tidak tersedia."}
              </p>
            </div>

            <SeriesManageButton series={series} />
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Daftar Episode</h2>
          </div>

          {series.episodes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <Tv className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Belum ada episode.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border max-h-[560px]">
              <table className="w-full min-w-[820px] table-fixed border-collapse text-sm">
                <thead>
                  <tr className="sticky top-0 bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">No.</th>
                    <th className="px-3 py-2 text-left font-medium">Episode</th>
                    <th className="px-3 py-2 text-left font-medium">Judul</th>
                    <th className="px-3 py-2 text-left font-medium">Rating</th>
                    <th className="px-3 py-2 text-left font-medium">Genre</th>
                    <th className="px-3 py-2 text-left font-medium">Diunggah</th>
                    <th className="px-3 py-2 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {series.episodes
                    .slice()
                    .sort(episodeSort)
                    .map((ep) => (
                      <tr key={ep.id} className="border-t border-border align-top">
                        <td className="px-3 py-3 align-top">
                          <span className="font-medium">{ep.episodeNumber}</span>
                          <span className="text-muted-foreground"> (S{ep.seasonNumber ?? 1})</span>
                        </td>
                        <td className="px-3 py-3 align-top">
                          {ep.thumbFileName ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/uploads/${ep.thumbFileName}`}
                              alt={ep.title}
                              className="size-16 shrink-0 rounded object-cover bg-muted"
                              loading="lazy"
                            />
                          ) : (
                            <span className="flex size-16 shrink-0 items-center justify-center rounded bg-muted">
                              <Tv className="size-7 text-muted-foreground" />
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex flex-col">
                            <span className="font-medium">{ep.title}</span>
                            {ep.description && (
                              <span className="line-clamp-2 text-xs text-muted-foreground">
                                {ep.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          {ep.rating && ep.rating > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                              <Star className="size-3 fill-current" />
                              {ep.rating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top">
                          {ep.genres && ep.genres.length > 0 ? ep.genres.join(", ") : "—"}
                        </td>
                        <td className="px-3 py-3 align-top text-muted-foreground">
                          {new Date(ep.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              href={`/play/${ep.id}`}
                              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                              aria-label={`Putar ${ep.title}`}
                            >
                              <Play className="size-4" />
                            </Link>
                            <EpisodeActions seriesId={id} episode={ep} />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
          {"\u00A9"} {new Date().getFullYear()} LakuFilm.
        </div>
      </footer>
      </div>
    </AuthGuard>
  )
}

function episodeSort(a: Episode, b: Episode) {
  const sa = a.seasonNumber ?? 1
  const sb = b.seasonNumber ?? 1
  if (sa !== sb) return sa - sb
  return (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0)
}

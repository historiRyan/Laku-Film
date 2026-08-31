import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Star, Tv } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { AuthGuard } from "@/components/auth-guard"
import { VideoPlayer } from "@/components/video-player"
import { getVideoQualities } from "@/lib/video-quality"
import { getLocalFilm, getEpisodeById, findSeriesForEpisode } from "@/lib/data-video"
import type { Episode } from "@/lib/types"

export const revalidate = 3600

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const film = (await getLocalFilm(id)) ?? (await getEpisodeById(id))

  if (!film) {
    notFound()
  }

  const isEpisode = "episodeNumber" in film
  const episode = isEpisode ? (film as Episode) : null
  const series = episode ? await findSeriesForEpisode(id) : null

  const poster = film.thumbFileName ? film.thumbFileName : "/placeholder.svg"
  const qualities = getVideoQualities(film.videoFiles, film.videoFileName)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link
          href={series ? `/series/${series.id}` : "/"}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {series ? "Kembali ke episode" : "Kembali ke daftar film"}
        </Link>

        <div className="grid gap-8 sm:grid-cols-[minmax(0,240px)_1fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt={`Thumbnail ${film.title}`}
              className="aspect-[2/3] h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Tv className="size-3.5" />
                <span>Series</span>
              </div>
              <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight">{film.title}</h1>
              <p className="mt-1 text-muted-foreground">
                {new Date(film.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {film.rating && film.rating > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                  <Star className="size-4 fill-current" />
                  {film.rating.toFixed(1)}
                </span>
              )}
              {film.genres &&
                film.genres.map((genre) => (
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
                {film.description || "Deskripsi tidak tersedia."}
              </p>
            </div>

            {series && episode && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Series:</span>
                <Link
                  href={`/series/${series.id}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {series.title}
                </Link>
                <span>•</span>
                <span>
                  Musim {episode.seasonNumber ?? 1}, Episode {episode.episodeNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        <VideoPlayer poster={poster} title={film.title} qualities={qualities} />

        {series && episode && (
          <div className="mt-6 flex items-center gap-2">
            <ArrowRight className="size-4 text-muted-foreground" />
              <Link
                href={`/series/${series.id}`}
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Lihat semua episode {series.title}
              </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-muted-foreground">
          {"\u00A9"} {new Date().getFullYear()} LakuFilm.
        </div>
      </footer>
      </div>
    </AuthGuard>
  )
}

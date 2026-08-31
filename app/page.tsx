import { SiteHeader } from "@/components/site-header"
import { HomeBrowser } from "@/components/home-browser"
import { ContinueWatching } from "@/components/continue-watching"
import { getMovies } from "@/lib/watchmode"
import { readDataVideo } from "@/lib/data-video"
import type { LocalFilm, Series } from "@/lib/types"

export const revalidate = 3600

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const sp = await searchParams
  const defaultTab = sp.tab === "series" ? "series" : "movie"

  const [watchmodeMovies, localMovies, localSeries] = await Promise.all([
    getMovies(),
    new Promise<LocalFilm[]>((resolve) => {
      try {
        const { videos } = readDataVideo()
        resolve(videos || [])
      } catch {
        resolve([])
      }
    }),
    new Promise<Series[]>((resolve) => {
      try {
        const { series } = readDataVideo()
        resolve(series || [])
      } catch {
        resolve([])
      }
    }),
  ])

  const movies = [...watchmodeMovies, ...localMovies]

  const externalEnabled = Boolean(process.env.WATCHMODE_API_KEY)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8 max-w-2xl">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Film populer pilihan LakuFilm
          </h1>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Kumpulan film dan series paling populer saat ini, lengkap dengan poster,
            rating, dan sinopsis singkat. Data diambil langsung dari Watchmode.
          </p>
        </section>

        {!externalEnabled && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Rekomendasi film eksternal (Watchmode) belum aktif. Setel{" "}
            <code className="rounded bg-amber-100 px-1">WATCHMODE_API_KEY</code> di{" "}
            <code className="rounded bg-amber-100 px-1">.env.local</code> untuk
            menampilkan film populer dari luar.
          </div>
        )}

        <HomeBrowser movies={movies} series={localSeries} defaultTab={defaultTab} />

        <ContinueWatching />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          {"\u00A9"} {new Date().getFullYear()} LakuFilm. Sumber data: Watchmode API.
        </div>
      </footer>
    </div>
  )
}

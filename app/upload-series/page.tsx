"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Film, Save, Plus, X, Trash2, ChevronDown } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { QualityLabel } from "@/lib/types"
import { QUALITY_LABELS, QUALITY_UPLOAD_FIELDS } from "@/lib/video-quality"
import { QualityVideoPicker } from "@/components/quality-video-picker"
import { Accordion } from "@base-ui/react/accordion"
import type { Series, Episode } from "@/lib/types"

type EpisodeForm = {
  uid: string
  id?: string
  title: string
  episodeNumber: string
  seasonNumber: string
  description: string
  rating: string
  genres: string[]
  genreInput: string
  qualityFiles: Partial<Record<QualityLabel, File>>
  existingVideoFileName?: string
  existingVideoFiles?: Partial<Record<QualityLabel, string>>
  thumbnailFile?: File | null
  existingThumbFileName?: string
  thumbPreviewUrl?: string
}

function makeEmptyEpisode(): EpisodeForm {
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    episodeNumber: "",
    seasonNumber: "",
    description: "",
    rating: "",
    genres: [],
    genreInput: "",
    qualityFiles: {},
  }
}

function filePreviewUrl(file: File | null | undefined): string | null {
  if (!file) return null
  return URL.createObjectURL(file)
}

export default function UploadSeriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, ready } = useAuth()

  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [rating, setRating] = useState("")
  const [genres, setGenres] = useState<string[]>([])
  const [genreInput, setGenreInput] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null)
  const [existingThumb, setExistingThumb] = useState<string | null>(null)

  const [episodes, setEpisodes] = useState<EpisodeForm[]>([makeEmptyEpisode()])
  const [openEpisodeUid, setOpenEpisodeUid] = useState<string | null>(episodes[0]?.uid ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditId(searchParams.get("edit"))
  }, [searchParams])

  useEffect(() => {
    if (ready && !user) router.replace("/login")
    if (ready && user && user.role !== "admin") router.replace("/")
  }, [ready, user, router])

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbPreviewUrl(null)
      return
    }
    const url = filePreviewUrl(thumbnailFile)
    if (!url) return
    setThumbPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [thumbnailFile])

  useEffect(() => {
    if (!editId || !user) return
    ;(async () => {
      try {
        const res = await fetch(`/api/series/${editId}`)
        if (!res.ok) {
          setError("Series yang Anda edit tidak ditemukan.")
          return
        }
        const data = await res.json()
        const s = data.series as Series
        if (s.owner !== user.username) {
          setError("Anda tidak memiliki akses mengedit series ini.")
          return
        }
        setTitle(s.title)
        setDescription(s.description)
        setRating(s.rating ? String(s.rating) : "")
        setGenres(s.genres ?? [])
        setExistingThumb(s.thumbFileName || null)

        const epForms: EpisodeForm[] = (s.episodes ?? []).map((ep) => ({
          uid: ep.id ?? `ep-${ep.episodeNumber}`,
          id: ep.id,
          title: ep.title,
          episodeNumber: String(ep.episodeNumber ?? ""),
          seasonNumber: ep.seasonNumber ? String(ep.seasonNumber) : "",
          description: ep.description ?? "",
          rating: ep.rating ? String(ep.rating) : "",
          genres: ep.genres ?? [],
          genreInput: "",
          qualityFiles: {},
          existingVideoFileName: ep.videoFileName,
          existingVideoFiles: ep.videoFiles,
          existingThumbFileName: ep.thumbFileName,
          thumbnailFile: null,
          thumbPreviewUrl: ep.thumbFileName ? `/uploads/${ep.thumbFileName}` : undefined,
        }))
        setEpisodes(epForms.length ? epForms : [makeEmptyEpisode()])
        setOpenEpisodeUid(epForms[0]?.uid ?? null)
      } catch {
        setError("Gagal memuat data series.")
      }
    })()
  }, [editId, user])

  function setEpisodeField(uid: string, patch: Partial<EpisodeForm>) {
    setEpisodes((prev) => prev.map((e) => (e.uid === uid ? { ...e, ...patch } : e)))
  }

  function addEpisode() {
    const newEp = makeEmptyEpisode()
    setEpisodes((prev) => [...prev, newEp])
    setOpenEpisodeUid(newEp.uid)
  }

  function removeEpisode(uid: string) {
    const next = episodes.filter((e) => e.uid !== uid)
    setEpisodes(next)
    if (openEpisodeUid === uid) {
      setOpenEpisodeUid(next.length ? next[0].uid : null)
    }
  }

  function handleThumbnailFile(selected: File | undefined) {
    if (!selected) return
    if (!selected.type.startsWith("image/")) {
      setError("Berkas harus berupa gambar.")
      return
    }
    setExistingThumb(null)
    setError(null)
    setThumbnailFile(selected)
  }

  function handleEpisodeThumb(uid: string, selected: File | undefined) {
    if (!selected) return
    if (!selected.type.startsWith("image/")) return
    setEpisodeField(uid, { thumbnailFile: selected, thumbPreviewUrl: filePreviewUrl(selected) ?? undefined })
  }

  function clearEpisodeThumb(uid: string) {
    const ep = episodes.find((e) => e.uid === uid)
    if (!ep) return
    if (ep.thumbPreviewUrl && ep.thumbnailFile) {
      URL.revokeObjectURL(ep.thumbPreviewUrl)
    }
    setEpisodeField(uid, {
      thumbnailFile: null,
      thumbPreviewUrl: undefined,
      existingThumbFileName: undefined,
    })
  }

  async function uploadQualityFiles(
    files: Partial<Record<QualityLabel, File>>,
  ): Promise<{
    videoFileName: string | null
    videoFiles: Partial<Record<QualityLabel, string>>
  }> {
    const hasVideo = QUALITY_LABELS.some((label) => files[label])
    if (!hasVideo) {
      return { videoFileName: null, videoFiles: {} }
    }
    const formData = new FormData()
    for (const label of QUALITY_LABELS) {
      const f = files[label]
      if (f) formData.append(QUALITY_UPLOAD_FIELDS[label], f)
    }
    const res = await fetch("/api/files", { method: "POST", body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Gagal mengunggah video.")
    }
    const result = await res.json()
    return { videoFileName: result.videoFileName ?? null, videoFiles: result.videoFiles ?? {} }
  }

  async function uploadSingleImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("thumbnail", file)
    const res = await fetch("/api/files", { method: "POST", body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Gagal mengunggah thumbnail.")
    }
    const result = await res.json()
    const name = result.thumbnailFileName as string | null
    if (!name) throw new Error("Gagal mengunggah thumbnail.")
    return name
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!user) return
    if (!title.trim()) {
      setError("Judul series wajib diisi.")
      return
    }
    if (!thumbnailFile && !existingThumb) {
      setError("Silakan pilih thumbnail series terlebih dahulu.")
      return
    }
    for (const ep of episodes) {
      if (!ep.title.trim()) {
        setError("Setiap episode harus memiliki judul.")
        return
      }
    }

    try {
      setSaving(true)

      let thumbFileName = existingThumb ?? ""
      if (thumbnailFile) {
        thumbFileName = await uploadSingleImage(thumbnailFile)
      }

      const payloadEpisodes: Partial<Episode>[] = []
      for (const ep of episodes) {
        const hasNewVideo = QUALITY_LABELS.some((label) => ep.qualityFiles[label])
        let videoFileName = ep.existingVideoFileName ?? ""
        let videoFiles: Partial<Record<QualityLabel, string>> | undefined = ep.existingVideoFiles

        let epThumb = ep.existingThumbFileName ?? ""
        if (ep.thumbnailFile) {
          epThumb = await uploadSingleImage(ep.thumbnailFile)
        } else if (!epThumb) {
          epThumb = thumbFileName
        }

        if (hasNewVideo) {
          const up = await uploadQualityFiles(ep.qualityFiles)
          if (up.videoFileName) videoFileName = up.videoFileName
          if (Object.keys(up.videoFiles).length > 0) videoFiles = up.videoFiles
        }

        if (!epThumb && thumbFileName) epThumb = thumbFileName

        payloadEpisodes.push({
          id: ep.id,
          title: ep.title.trim(),
          description: ep.description.trim(),
          owner: user.username,
          videoFileName,
          videoFiles,
          thumbFileName: epThumb,
          createdAt: ep.id ? undefined : Date.now(),
          rating: ep.rating ? Number(ep.rating) : undefined,
          genres: ep.genres,
          episodeNumber: Number(ep.episodeNumber) || 1,
          seasonNumber: ep.seasonNumber ? Number(ep.seasonNumber) : undefined,
          seriesId: editId ?? undefined,
        })
      }

      if (editId) {
        const res = await fetch(`/api/series/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            rating: rating ? Number(rating) : 0,
            genres,
            thumbFileName,
            episodes: payloadEpisodes,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "Gagal memperbarui series.")
        }
      } else {
        const res = await fetch("/api/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            owner: user.username,
            thumbFileName,
            rating: rating ? Number(rating) : 0,
            genres,
            episodes: payloadEpisodes,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || "Gagal membuat series.")
        }
      }

      router.push("/?tab=series")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Gagal menyimpan series. Coba lagi.")
      setSaving(false)
    }
  }

  function commitGenreInput(uid: string) {
    const ep = episodes.find((e) => e.uid === uid)
    if (!ep || !ep.genreInput.trim()) return
    const added = ep.genreInput
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)
    setEpisodeField(uid, {
      genres: [...new Set([...ep.genres, ...added])],
      genreInput: "",
    })
  }

  function removeEpisodeGenre(uid: string, idx: number) {
    const ep = episodes.find((e) => e.uid === uid)
    if (!ep) return
    setEpisodeField(uid, { genres: ep.genres.filter((_, i) => i !== idx) })
  }

  function commitSeriesGenre() {
    if (!genreInput.trim()) return
    const added = genreInput
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)
    setGenres([...new Set([...genres, ...added])])
    setGenreInput("")
  }

  function removeSeriesGenre(idx: number) {
    setGenres(genres.filter((_, i) => i !== idx))
  }

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-muted-foreground">Memuat...</p>
        </main>
      </div>
    )
  }

  const isEditMode = !!editId

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Series" : "Unggah Series"}
          </h1>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            {isEditMode
              ? "Perbarui informasi series dan episode Anda."
              : "Tambahkan series dengan satu atau lebih episode. Video disimpan di perangkat ini saja."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detail Series</CardTitle>
              <CardDescription>
                {isEditMode ? "Ubah informasi series di bawah ini." : "Isi info series, lalu tambahkan episode."}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Judul Series</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul series"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan tentang series ini..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Rating Series (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="Misal: 8.4"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Genre Series (pisahkan dengan koma)</Label>
                <div className="flex gap-2">
                  <Input
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onBlur={commitSeriesGenre}
                    placeholder="Action, Drama, Comedy"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!genreInput.trim()}
                    onClick={commitSeriesGenre}
                  >
                    Tambah
                  </Button>
                </div>
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeSeriesGenre(i)}
                          className="ml-1.5 inline-flex text-primary-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="series-thumbnail">Thumbnail Series</Label>
                <input
                  ref={thumbnailInputRef}
                  id="series-thumbnail"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleThumbnailFile(e.target.files?.[0])}
                />

                {thumbPreviewUrl ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbPreviewUrl} className="aspect-video w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <span className="flex items-center gap-2 truncate text-sm text-muted-foreground">
                        <Film className="size-4 shrink-0" />
                        <span className="truncate">{thumbnailFile?.name}</span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Hapus thumbnail terpilih"
                        onClick={() => {
                          if (thumbPreviewUrl) URL.revokeObjectURL(thumbPreviewUrl)
                          setThumbnailFile(null)
                          setThumbPreviewUrl(null)
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : existingThumb ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/uploads/${existingThumb}`} className="aspect-video w-full object-cover" />
                    <div className="px-3 py-2">
                      <span className="text-xs text-muted-foreground">
                        Thumbnail saat ini (ganti untuk memperbarui)
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors hover:bg-muted"
                  >
                    <Film className="size-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Klik untuk memilih thumbnail</span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG, dan format gambar lainnya
                    </span>
                  </button>
                )}
              </div>

              <div className="pt-2">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Episode</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addEpisode}>
                    <Plus className="size-4 mr-1" />
                    Tambah Episode
                  </Button>
                </div>

                {episodes.length === 0 && (
                  <button
                    type="button"
                    onClick={addEpisode}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 py-8 text-center transition-colors hover:bg-muted"
                  >
                    <Plus className="size-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Tambah episode pertama</span>
                  </button>
                )}

                <Accordion.Root
                  value={openEpisodeUid ? [openEpisodeUid] : []}
                  onValueChange={(values) => {
                    setOpenEpisodeUid(values.length > 0 ? (values[0] as string) : null)
                  }}
                >
                  {episodes.map((ep, i) => (
                    <EpisodeForm
                      key={ep.uid}
                      ep={ep}
                      index={i}
                      isOpen={openEpisodeUid === ep.uid}
                      onField={(patch) => setEpisodeField(ep.uid, patch)}
                      onThumb={(file) => handleEpisodeThumb(ep.uid, file)}
                      onClearThumb={() => clearEpisodeThumb(ep.uid)}
                      onRemove={() => removeEpisode(ep.uid)}
                      onCommitGenre={() => commitGenreInput(ep.uid)}
                      onRemoveGenre={(idx) => removeEpisodeGenre(ep.uid, idx)}
                    />
                  ))}
                </Accordion.Root>
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </CardContent>

            <CardFooter className="mt-6 flex items-center gap-3">
              <div className="w-full space-y-2">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Film className="size-4 animate-spin" />
                      {isEditMode ? "Menyimpan..." : "Mengunggah..."}
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      {isEditMode ? "Simpan Perubahan" : "Simpan Series"}
                    </>
                  )}
                </Button>
              </div>
              <Link
                href="/?tab=series"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Batal
              </Link>
            </CardFooter>
          </Card>
        </form>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-muted-foreground">
          {"\u00A9"} {new Date().getFullYear()} LakuFilm.
        </div>
      </footer>
    </div>
  )
}

function EpisodeForm({
  ep,
  index,
  isOpen,
  onField,
  onThumb,
  onClearThumb,
  onRemove,
  onCommitGenre,
  onRemoveGenre,
}: {
  ep: EpisodeForm
  index: number
  isOpen: boolean
  onField: (patch: Partial<EpisodeForm>) => void
  onThumb: (file: File | undefined) => void
  onClearThumb: () => void
  onRemove: () => void
  onCommitGenre: () => void
  onRemoveGenre: (idx: number) => void
}) {
  return (
    <Accordion.Item
      value={ep.uid}
      className={cn(
        "mb-3 overflow-hidden rounded-lg border border-border bg-card",
        isOpen && "bg-accent/40",
      )}
    >
      <Accordion.Header className="flex w-full items-center justify-between gap-3 px-4 py-3">
        <Accordion.Trigger className="flex flex-1 cursor-pointer items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {index + 1}
          </span>
          <span className="font-medium">
            {ep.title ? ep.title : `Episode ${index + 1}`}
          </span>
          <ChevronDown
            className={cn(
              "ml-auto size-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </Accordion.Trigger>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="inline-flex items-center justify-center rounded text-destructive opacity-60 hover:opacity-100"
          aria-label="Hapus episode"
        >
          <Trash2 className="size-4" />
        </button>
      </Accordion.Header>

      <Accordion.Panel className="px-4 pb-4 pt-0">
        <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Judul Episode</Label>
          <Input
            value={ep.title}
            onChange={(e) => onField({ title: e.target.value })}
            placeholder="Judul episode"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Nomor Episode</Label>
          <Input
            type="number"
            min="1"
            value={ep.episodeNumber}
            onChange={(e) => onField({ episodeNumber: e.target.value })}
            placeholder="Mis. 1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Musim (Season)</Label>
          <Input
            type="number"
            min="1"
            value={ep.seasonNumber}
            onChange={(e) => onField({ seasonNumber: e.target.value })}
            placeholder="Mis. 1"
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Rating Episode</Label>
          <Input
            type="number"
            min="1"
            max="10"
            step="0.1"
            value={ep.rating}
            onChange={(e) => onField({ rating: e.target.value })}
            placeholder="Mis. 8.4"
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Deskripsi Episode</Label>
          <Textarea
            value={ep.description}
            onChange={(e) => onField({ description: e.target.value })}
            placeholder="Deskripsi singkat episode..."
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>Genre Episode (pisahkan dengan koma)</Label>
          <div className="flex gap-2">
            <Input
              value={ep.genreInput}
              onChange={(e) => onField({ genreInput: e.target.value })}
              onBlur={onCommitGenre}
              placeholder="Action, Comedy"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!ep.genreInput.trim()}
              onClick={onCommitGenre}
            >
              Tambah
            </Button>
          </div>
          {ep.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ep.genres.map((genre, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => onRemoveGenre(i)}
                    className="ml-1.5 inline-flex text-secondary-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-5">
        {QUALITY_LABELS.map((label) => (
          <QualityVideoPicker
            key={label}
            label={label}
            file={ep.qualityFiles[label] ?? null}
            onFile={(file) => {
              const next = { ...ep.qualityFiles }
              if (file) {
                next[label] = file
              } else {
                delete next[label]
              }
              onField({ qualityFiles: next })
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1">
          {ep.existingThumbFileName || ep.thumbPreviewUrl ? (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ep.thumbPreviewUrl ?? `/uploads/${ep.existingThumbFileName ?? ""}`}
                alt={ep.title || `Episode ${index + 1}`}
                className="h-10 w-16 shrink-0 rounded object-cover bg-muted"
              />
              <span className="text-xs text-muted-foreground truncate">
                {ep.thumbnailFile?.name || "Thumbnail saat ini"}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Tidak ada thumbnail. Pakai thumbnail series.
            </span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          id={`ep-thumb-${ep.uid}`}
          onChange={(e) => onThumb(e.target.files?.[0])}
        />
        <Label
          htmlFor={`ep-thumb-${ep.uid}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer")}
        >
          Pilih Thumbnail
        </Label>
          {(ep.existingThumbFileName || ep.thumbPreviewUrl) && (
            <Button type="button" variant="ghost" size="sm" onClick={onClearThumb}>
              <X className="size-4" />
            </Button>
          )}
      </div>
    </Accordion.Panel>
    </Accordion.Item>
  )
}

"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Film, UploadCloud, X, Save } from "lucide-react"

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
import type { LocalFilm } from "@/lib/types"
import { QUALITY_LABELS, QUALITY_UPLOAD_FIELDS } from "@/lib/video-quality"
import { QualityVideoPicker } from "@/components/quality-video-picker"

export default function UploadPage() {
  const router = useRouter()
  const { user, ready } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [rating, setRating] = useState<number>(0)
  const [genres, setGenres] = useState<string[]>([])
  const [genreInput, setGenreInput] = useState("")
  const [qualityFiles, setQualityFiles] = useState<Partial<Record<QualityLabel, File>>>({})
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [existingFilm, setExistingFilm] = useState<LocalFilm | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditId(new URLSearchParams(window.location.search).get("edit"))
  }, [])

  useEffect(() => {
    if (ready && !user) router.replace("/login")
    if (ready && user && user.role !== "admin") router.replace("/")
  }, [ready, user, router])

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(thumbnailFile)
    setThumbnailPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [thumbnailFile])

  useEffect(() => {
    if (!editId || !user) return
    ;(async () => {
      try {
        const res = await fetch(`/api/films/${editId}`)
        if (!res.ok) {
          setError("Film yang Anda edit tidak ditemukan.")
          return
        }
        const data = await res.json()
        const film = data.film as LocalFilm
        if (film.owner !== user.username) {
          setError("Anda tidak memiliki akses mengedit film ini.")
          return
        }
        setExistingFilm(film)
        setTitle(film.title)
        setDescription(film.description)
        setRating(film.rating ?? 0)
        setGenres(film.genres ?? [])
      } catch {
        setError("Gagal memuat data film.")
      }
    })()
  }, [editId, user])

  function setQualityFile(label: QualityLabel, file: File | null) {
    setQualityFiles((prev) => {
      const next = { ...prev }
      if (file) {
        next[label] = file
      } else {
        delete next[label]
      }
      return next
    })
  }

  function handleThumbnailFile(selected: File | undefined) {
    if (!selected) return
    if (!selected.type.startsWith("image/")) {
      setError("Berkas harus berupa gambar.")
      return
    }
    setError(null)
    setThumbnailFile(selected)
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setRating(0)
    setGenres([])
    setGenreInput("")
    setQualityFiles({})
    setThumbnailFile(null)
    setThumbnailPreviewUrl(null)
    setExistingFilm(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!user) return
    if (!title.trim()) {
      setError("Judul film wajib diisi.")
      return
    }

    try {
      setSaving(true)

      const hasNewVideo = QUALITY_LABELS.some((label) => qualityFiles[label])

      if (!editId) {
        if (!hasNewVideo) {
          setError("Silakan pilih setidaknya satu berkas video (720p atau 1080p).")
          return
        }
        if (!thumbnailFile) {
          setError("Silakan pilih thumbnail terlebih dahulu.")
          return
        }
      }

      let videoFileName: string | undefined
      let videoFiles: object | undefined
      let thumbFileName: string | undefined

      if (hasNewVideo || thumbnailFile) {
        const formData = new FormData()
        for (const label of QUALITY_LABELS) {
          const f = qualityFiles[label]
          if (f) formData.append(QUALITY_UPLOAD_FIELDS[label], f)
        }
        if (thumbnailFile) formData.append("thumbnail", thumbnailFile)

        const uploadRes = await fetch("/api/files", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}))
          throw new Error(errorData.error || "Gagal mengunggah berkas.")
        }

        const result = await uploadRes.json()
        videoFileName = result.videoFileName
        videoFiles = result.videoFiles
        thumbFileName = result.thumbnailFileName
      }

      if (editId) {
        const patchBody: Record<string, unknown> = {
          title: title.trim(),
          description: description.trim(),
          rating,
          genres,
        }
        if (videoFileName) patchBody.videoFileName = videoFileName
        if (videoFiles) patchBody.videoFiles = videoFiles
        if (thumbFileName) patchBody.thumbFileName = thumbFileName

        const patchRes = await fetch(`/api/films/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        })
        if (!patchRes.ok) {
          const err = await patchRes.json().catch(() => ({}))
          throw new Error(err.error || "Gagal memperbarui film.")
        }
      } else {
        if (
          !videoFileName ||
          !thumbFileName ||
          videoFiles === undefined
        ) {
          throw new Error("Gagal mengunggah berkas.")
        }

        const createForm = new FormData()
        createForm.append("title", title.trim())
        createForm.append("description", description.trim())
        createForm.append("rating", String(rating))
        createForm.append("genres", genres.join(","))
        createForm.append("videoFileName", videoFileName)
        createForm.append("thumbFileName", thumbFileName)
        createForm.append("videoFiles", JSON.stringify(videoFiles))

        const createRes = await fetch("/api/films", {
          method: "POST",
          body: createForm,
        })
        if (!createRes.ok) {
          const err = await createRes.json().catch(() => ({}))
          throw new Error(err.error || "Gagal menyimpan film.")
        }
      }

      resetForm()
      router.push("/film-saya")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Gagal menyimpan video. Coba lagi.")
      setSaving(false)
    }
  }

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16">
          <p className="text-muted-foreground">Memuat...</p>
        </main>
      </div>
    )
  }

  const isEditMode = !!editId

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Film" : "Unggah Film"}
          </h1>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            {isEditMode
              ? "Perbarui informasi film Anda."
              : "Tambahkan film Anda sendiri. Video disimpan di perangkat ini saja."}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Detail Film</CardTitle>
              <CardDescription>
                {isEditMode
                  ? "Ubah informasi film di bawah ini."
                  : "Isi informasi film dan pilih berkas videonya."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul film"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan tentang film ini..."
                  rows={4}
                />
              </div>

              {QUALITY_LABELS.map((label) => (
                <QualityVideoPicker
                  key={label}
                  label={label}
                  file={qualityFiles[label] ?? null}
                  onFile={(file) => setQualityFile(label, file)}
                />
              ))}

              <div className="flex flex-col gap-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <input
                  ref={thumbnailInputRef}
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleThumbnailFile(e.target.files?.[0])}
                />

                {thumbnailPreviewUrl ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailPreviewUrl} className="aspect-video w-full object-cover" />
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
                          setThumbnailFile(null)
                          if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : existingFilm?.thumbFileName ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={existingFilm.thumbFileName}
                      className="aspect-video w-full object-cover"
                    />
                    <div className="px-3 py-2">
                      <span className="text-xs text-muted-foreground">Thumbnail saat ini (ganti untuk memperbarui)</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors hover:bg-muted"
                  >
                    <UploadCloud className="size-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Klik untuk memilih thumbnail</span>
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG, dan format gambar lainnya
                    </span>
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Rating (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  placeholder="Misal: 8.4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Genre (pisahkan dengan koma)</Label>
                <Input
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  onBlur={() => {
                    if (genreInput) {
                      setGenres(
                        [
                          ...new Set([
                            ...genres,
                            ...genreInput.split(",").map((g) => g.trim()),
                          ]),
                        ].filter(Boolean),
                      )
                      setGenreInput("")
                    }
                  }}
                  placeholder="Action, Drama, Comedy"
                />
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
                          onClick={() => setGenres(genres.filter((_, index) => index !== i))}
                          className="ml-1.5 inline-flex text-primary-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                      {isEditMode ? <Save className="size-4" /> : <UploadCloud className="size-4" />}
                      {isEditMode ? "Simpan Perubahan" : "Unggah Film"}
                    </>
                  )}
                </Button>
                {saving && (
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              <Link
                href="/film-saya"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                {isEditMode ? "Batal" : "Batal"}
              </Link>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}

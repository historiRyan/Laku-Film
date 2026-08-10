import { useEffect, useRef, useState } from "react"
import { UploadCloud, X, Film as FilmIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { QualityLabel } from "@/lib/types"

export type QualityFileValue = {
  label: QualityLabel
  file: File
}

export function QualityVideoPicker({
  label,
  file,
  onFile,
}: {
  label: QualityLabel
  file: File | null
  onFile: (file: File | null) => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function clear() {
    onFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`video-${label}`}>Berkas Video {label}</Label>
      <input
        ref={inputRef}
        id={`video-${label}`}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(e) => {
          const selected = e.target.files?.[0]
          if (!selected) return
          if (!selected.type.startsWith("video/")) return
          onFile(selected)
        }}
      />

      {previewUrl ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <video src={previewUrl} controls className="aspect-video w-full bg-black" />
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="flex items-center gap-2 truncate text-sm text-muted-foreground">
              <FilmIcon className="size-4 shrink-0" />
              <span className="truncate">{file?.name}</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Hapus video ${label}`}
              onClick={clear}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors hover:bg-muted"
        >
          <UploadCloud className="size-8 text-muted-foreground" />
          <span className="text-sm font-medium">Klik untuk memilih video {label}</span>
          <span className="text-xs text-muted-foreground">
            MP4, WebM, dan format video lainnya
          </span>
        </button>
      )}
    </div>
  )
}

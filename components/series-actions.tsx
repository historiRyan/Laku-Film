"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Episode, Series } from "@/lib/types"

export function EpisodeActions({
  seriesId,
  episode,
}: {
  seriesId: string
  episode: Episode
}) {
  const { user } = useAuth()
  const router = useRouter()
  const canEdit = user && episode.owner === user.username

  async function handleDelete() {
    if (!confirm(`Hapus "${episode.title}"? Berkas video dan thumbnail akan dihapus.`)) return
    await fetch(`/api/series/${seriesId}/episodes/${episode.id}`, { method: "DELETE" })
    router.refresh()
  }

  if (!canEdit) return null

  return (
    <>
      <Link
        href={`/upload-series?edit=${seriesId}&episode=${episode.id}`}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 w-8 shrink-0 rounded-md p-0",
        )}
        aria-label={`Edit ${episode.title}`}
      >
        <Pencil className="size-4" />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 w-8 shrink-0 rounded-md p-0 text-destructive",
        )}
        aria-label={`Hapus ${episode.title}`}
      >
        <Trash2 className="size-4" />
      </button>
    </>
  )
}

export function SeriesManageButton({ series }: { series: Series }) {
  const { user } = useAuth()
  const router = useRouter()
  const canEdit = user && series.owner === user.username

  if (!canEdit) return null

  async function handleDelete() {
    if (!confirm(`Hapus series "${series.title}"? Semua episode akan dihapus.`)) return
    await fetch(`/api/series/${series.id}`, { method: "DELETE" })
    router.replace("/?tab=series", { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/upload-series?edit=${series.id}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-2")}
      >
        <Pencil className="size-4" />
        Edit Series
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className={cn(buttonVariants({ variant: "destructive", size: "sm" }), "flex items-center gap-2")}
      >
        <Trash2 className="size-4" />
        Hapus Series
      </button>
    </div>
  )
}

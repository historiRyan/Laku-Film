import Link from "next/link"
import { Film, Home } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="flex max-w-md flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Film className="size-8 text-muted-foreground" />
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
            Maaf, halaman yang Anda cari tidak tersedia atau mungkin sudah dipindahkan.
          </p>
          <Link href="/" className={cn(buttonVariants(), "mt-6 flex items-center gap-2")}>
            <Home className="size-4" />
            Kembali ke beranda
          </Link>
        </div>
      </main>
    </div>
  )
}

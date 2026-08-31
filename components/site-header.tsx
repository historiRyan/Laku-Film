"use client"

import Link from "next/link"
import { Clapperboard, LogOut, Upload, Tv } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { AuthModal } from "@/components/auth-modal"
import { AdminManager } from "@/components/admin-manager"
import { ThemeToggle } from "@/components/theme-toggle"
import { MovieSearch } from "@/components/movie-search"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const { user, ready, logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clapperboard className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">LakuFilm</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden items-center sm:flex">
            <MovieSearch />
          </div>
          {ready && user ? (
            <>
              <Link
                href="/?tab=series"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              >
                Series
              </Link>
              <Link
                href="/watchlist"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              >
                Watchlist
              </Link>
              {user.role === "admin" && (
                <>
                  <Link
                    href="/film-saya"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
                  >
                    Film Saya
                  </Link>
                  <Link href="/upload" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    <Upload className="size-4" />
                    <span className="hidden sm:inline">Unggah</span>
                  </Link>
                  <Link
                    href="/upload-series"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")}
                  >
                    <Tv className="size-4" />
                    <span className="hidden sm:inline">Unggah Series</span>
                  </Link>
                  <AdminManager />
                </>
              )}
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Keluar">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </>
          ) : ready ? (
            <AuthModal />
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

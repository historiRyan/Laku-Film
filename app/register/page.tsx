"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useAuth } from "@/components/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const result = await register(name, username, password)
    if (!result.ok) {
      setError(result.error ?? "Gagal mendaftar.")
      return
    }
    const url = new URLSearchParams(window.location.search)
    const callbackUrl = url.get("callbackUrl")
    router.push(callbackUrl || "/")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Daftar</CardTitle>
            <CardDescription>Buat akun untuk mulai mengunggah film Anda.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Buat kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </CardContent>
            <CardFooter className="mt-6 flex flex-col gap-4">
              <Button type="submit" className="w-full">
                Daftar
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
                  Masuk
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}

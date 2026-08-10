"use client"

import { useState, type FormEvent } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Shield, X } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

export function AdminManager() {
  const { registerAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const result = await registerAdmin(name, username, password)
    if (!result.ok) {
      setError(result.error ?? "Gagal membuat akun admin.")
      return
    }
    setSuccess(`Admin "${username}" berhasil dibuat.`)
    setName("")
    setUsername("")
    setPassword("")
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex"
      >
        <Shield className="size-4 mr-1" />
        Kelola Admin
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen} modal="trap-focus">
        <Dialog.Portal>
          <Dialog.Popup>
            <Dialog.Backdrop className="fixed inset-0 bg-background/80" />
            <Dialog.Viewport className="fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 p-4">
              <Dialog.Title className="sr-only">
                Buat Akun Admin Baru
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                Formulir pembuatan akun admin baru
              </Dialog.Description>
              <Card className="w-full max-w-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Buat Admin Baru</CardTitle>
                    <Dialog.Close
                      className="h-6 w-6 shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
                      aria-label="Tutup"
                    >
                      <X className="size-3.5" />
                    </Dialog.Close>
                  </div>
                  <CardDescription>
                    Buat akun admin baru untuk pengguna lain. Akun ini akan
                    memiliki hak akses lengkap.
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                  <CardContent className="flex flex-col gap-6 pt-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="admin-reg-name">Nama Lengkap</Label>
                      <Input
                        id="admin-reg-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Masukkan nama lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="admin-reg-username">Username</Label>
                      <Input
                        id="admin-reg-username"
                        type="text"
                        autoComplete="username"
                        placeholder="Masukkan username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="admin-reg-password">Kata Sandi</Label>
                      <Input
                        id="admin-reg-password"
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
                    {success && (
                      <p className="text-sm text-green-600" role="status">
                        {success}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="mt-6">
                    <Button type="submit" className="w-full">
                      Buat Akun Admin
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </Dialog.Viewport>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

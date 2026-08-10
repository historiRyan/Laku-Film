"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"

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

export function AuthModal() {
  const router = useRouter()
  const { login, register } = useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"login" | "register">("login")

  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)

  const [regName, setRegName] = useState("")
  const [regUsername, setRegUsername] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regError, setRegError] = useState<string | null>(null)

  function reset() {
    setOpen(false)
    setMode("login")
    setLoginUsername("")
    setLoginPassword("")
    setLoginError(null)
    setRegName("")
    setRegUsername("")
    setRegPassword("")
    setRegError(null)
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoginError(null)
    const result = await login(loginUsername, loginPassword)
    if (!result.ok) {
      setLoginError(result.error ?? "Gagal masuk.")
      return
    }
    reset()
    const url = new URLSearchParams(window.location.search)
    const callbackUrl = url.get("callbackUrl")
    const redirectUrl = callbackUrl || (result.role === "admin" ? "/upload" : "/")
    router.push(redirectUrl)
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setRegError(null)
    const result = await register(regName, regUsername, regPassword)
    if (!result.ok) {
      setRegError(result.error ?? "Gagal mendaftar.")
      return
    }
    reset()
    router.push("/")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMode("login")
          setOpen(true)
        }}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Masuk
      </button>
      <button
        type="button"
        onClick={() => {
          setMode("register")
          setOpen(true)
        }}
        className={cn(buttonVariants({ size: "sm" }))}
      >
        Daftar
      </button>

      <Dialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) reset()
        }}
        modal="trap-focus"
      >
        <Dialog.Portal>
          <Dialog.Popup>
            <Dialog.Backdrop className="fixed inset-0 bg-background/80" />
            <Dialog.Viewport className="fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 p-4">
              <Dialog.Title className="sr-only">
                {mode === "login" ? "Masuk" : "Daftar"}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                {mode === "login"
                  ? "Formulir masuk akun"
                  : "Formulir pembuatan akun baru"}
              </Dialog.Description>
              <Card className="w-full max-w-lg p-6">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    {mode === "login" ? "Masuk" : "Daftar"}
                  </CardTitle>
                  <Dialog.Close
                    className="h-6 w-6 shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
                    aria-label="Tutup"
                  >
                    <X className="size-3.5" />
                  </Dialog.Close>
                </div>
                <CardDescription>
                  {mode === "login"
                    ? "Masuk untuk mengelola film Anda."
                    : "Buat akun untuk mulai mengunggah film."}
                </CardDescription>
              </CardHeader>

              {mode === "login" ? (
                <form onSubmit={handleLogin}>
                  <CardContent className="flex flex-col gap-6 pt-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="auth-login-username">Username</Label>
                      <Input
                        id="auth-login-username"
                        type="text"
                        autoComplete="username"
                        placeholder="Masukkan username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="auth-login-password">Kata Sandi</Label>
                      <Input
                        id="auth-login-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Masukkan kata sandi"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                    {loginError && (
                      <p className="text-sm text-destructive" role="alert">
                        {loginError}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="mt-6 flex flex-col gap-4">
                    <Button type="submit" className="h-10 w-full">
                      Masuk
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Belum punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("register")}
                        className="font-medium text-foreground underline underline-offset-4"
                      >
                        Daftar
                      </button>
                    </p>
                  </CardFooter>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <CardContent className="flex flex-col gap-6 pt-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="auth-reg-name">Nama</Label>
                      <Input
                        id="auth-reg-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Nama lengkap"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="auth-reg-username">Username</Label>
                      <Input
                        id="auth-reg-username"
                        type="text"
                        autoComplete="username"
                        placeholder="Masukkan username"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="auth-reg-password">Kata Sandi</Label>
                      <Input
                        id="auth-reg-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Buat kata sandi"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="h-10"
                      />
                    </div>
                    {regError && (
                      <p className="text-sm text-destructive" role="alert">
                        {regError}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="mt-6 flex flex-col gap-4">
                    <Button type="submit" className="h-10 w-full">
                      Daftar
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Sudah punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="font-medium text-foreground underline underline-offset-4"
                      >
                        Masuk
                      </button>
                    </p>
                  </CardFooter>
                </form>
              )}
            </Card>
            </Dialog.Viewport>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

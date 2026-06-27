"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        toast.error("Email ini sudah terdaftar. Coba login atau gunakan email lain.")
      } else {
        toast.error("Gagal mendaftar. Coba beberapa saat lagi.")
      }
      setLoading(false)
      return
    }

    setEmailSent(true)
    setLoading(false)
  }

  if (emailSent) {
    return (
      <div className="card-base p-8 shadow-lg rounded-2xl text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📧</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Cek Email Kamu!</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Kami telah mengirim link verifikasi ke email kamu. Klik link tersebut untuk mengaktifkan akun.
        </p>
        <p className="text-xs text-neutral-400">
          Link berlaku selama 24 jam.{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-brand-600 hover:underline"
          >
            Kembali ke login
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="card-base p-8 shadow-lg rounded-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Mulai Belajar Marketing</h1>
        <p className="text-sm text-neutral-500 mt-1">Buat akun gratis — tidak perlu kartu kredit</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            type="text"
            placeholder="Nama kamu"
            autoComplete="name"
            className={errors.name ? "border-danger-500" : ""}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-danger-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="kamu@email.com"
            autoComplete="email"
            className={errors.email ? "border-danger-500" : ""}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-danger-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              className={`pr-10 ${errors.password ? "border-danger-500" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-danger-600">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-500 hover:bg-brand-600 text-white h-11"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Mendaftar...
            </>
          ) : (
            "Daftar Sekarang"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-6">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

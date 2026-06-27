"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    // Selalu tampilkan sukses (cegah user enumeration)
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="card-base p-8 shadow-lg rounded-2xl text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔑</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Cek Email Kamu</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Jika email terdaftar, link reset password telah dikirim. Link berlaku 24 jam.
        </p>
        <Link href="/login" className="text-brand-600 hover:underline text-sm">
          ← Kembali ke login
        </Link>
      </div>
    )
  }

  return (
    <div className="card-base p-8 shadow-lg rounded-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Reset Password</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Masukkan email kamu dan kami akan kirim link reset password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="kamu@email.com"
            className={errors.email ? "border-danger-500" : ""}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-danger-600">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-500 hover:bg-brand-600 text-white h-11"
          disabled={loading}
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</> : "Kirim Link Reset"}
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-6">
        <Link href="/login" className="text-brand-600 hover:underline">← Kembali ke login</Link>
      </p>
    </div>
  )
}

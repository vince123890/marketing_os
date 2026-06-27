"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      if (error.message.includes("expired")) {
        toast.error("Link reset sudah kadaluarsa. Minta link baru.")
      } else {
        toast.error("Gagal mengubah password. Coba lagi.")
      }
      setLoading(false)
      return
    }

    toast.success("Password berhasil diubah! Silakan login kembali.")
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="card-base p-8 shadow-lg rounded-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Buat Password Baru</h1>
        <p className="text-sm text-neutral-500 mt-1">Pilih password baru yang kuat</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Password Baru</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="Minimal 8 karakter"
              className={`pr-10 ${errors.password ? "border-danger-500" : ""}`}
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger-600">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            id="confirmPassword"
            type={showPw ? "text" : "password"}
            placeholder="Ulangi password baru"
            className={errors.confirmPassword ? "border-danger-500" : ""}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-danger-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white h-11" disabled={loading}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : "Simpan Password Baru"}
        </Button>
      </form>
    </div>
  )
}

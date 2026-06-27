import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminClient from "@/components/admin/AdminClient"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) redirect("/dashboard")

  return (
    <div className="max-w-[860px] animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Verifikasi Pembayaran</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Review bukti transfer dan aktifkan langganan pengguna.
        </p>
      </div>
      <AdminClient />
    </div>
  )
}

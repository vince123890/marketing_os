import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CertificateClient from "@/components/certificate/CertificateClient"

export default async function CertificatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { count: completedCount }] = await Promise.all([
    supabase.from("users").select("name").eq("id", user.id).single(),
    supabase
      .from("user_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
  ])

  const completed = completedCount ?? 0
  const isEligible = completed >= 19

  if (!isEligible) {
    return (
      <div className="max-w-[600px] animate-fade-in text-center py-16">
        <div className="text-5xl mb-4">🎓</div>
        <h1 className="text-2xl font-bold text-neutral-800">Sertifikat belum tersedia</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Selesaikan semua 19 modul untuk membuka sertifikat penyelesaian.
        </p>
        <p className="text-sm text-brand-600 font-semibold mt-4">
          Progress: {completed}/19 modul selesai
        </p>
      </div>
    )
  }

  // Best score per module → average, as the certificate grade
  const { data: subs } = await supabase
    .from("task_submissions")
    .select("module_id, score")
    .eq("user_id", user.id)
    .not("score", "is", null)

  const bestByModule = new Map<string, number>()
  for (const s of subs ?? []) {
    if (s.score === null) continue
    const prev = bestByModule.get(s.module_id)
    if (prev === undefined || s.score > prev) bestByModule.set(s.module_id, s.score)
  }
  const scores = [...bestByModule.values()]
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null

  return (
    <CertificateClient
      name={profile?.name || "Marketer"}
      avgScore={avgScore}
      userId={user.id}
    />
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ModuleCard from "@/components/modules/ModuleCard"
import { Bookmark } from "lucide-react"

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: progressRows }] = await Promise.all([
    supabase.from("users").select("current_plan").eq("id", user.id).single(),
    supabase
      .from("user_progress")
      .select("module_id, status, is_bookmarked")
      .eq("user_id", user.id)
      .eq("is_bookmarked", true),
  ])

  const rows = (progressRows ?? []) as { module_id: string; status: string; is_bookmarked: boolean }[]
  const moduleIds = rows.map((r) => r.module_id)

  const { data: modules } = moduleIds.length
    ? await supabase
        .from("modules")
        .select("id, order_number, title, slug")
        .in("id", moduleIds)
        .eq("is_published", true)
        .order("order_number")
    : { data: [] as { id: string; order_number: number; title: string; slug: string }[] }

  const progressMap = new Map(rows.map((r) => [r.module_id, r]))
  const currentPlan = profile?.current_plan ?? "free"

  const enriched = (modules ?? []).map((m) => {
    const progress = progressMap.get(m.id)
    return {
      ...m,
      status: (progress?.status ?? "not_started") as "not_started" | "in_progress" | "completed",
      isLocked: false,
      lockReason: null,
      isBookmarked: true,
    }
  })

  return (
    <div className="max-w-[720px] animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Tersimpan</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Modul yang kamu bookmark untuk dibaca nanti.
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <Bookmark size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Belum ada modul tersimpan</p>
          <p className="text-xs mt-1">Klik ikon bookmark pada modul manapun untuk menyimpannya di sini.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enriched.map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              status={m.status}
              isLocked={false}
              lockReason={null}
              isBookmarked={true}
              currentPlan={currentPlan}
            />
          ))}
        </div>
      )}
    </div>
  )
}

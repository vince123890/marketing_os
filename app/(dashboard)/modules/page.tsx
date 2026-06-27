import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ModuleListClient from "@/components/modules/ModuleListClient"

export default async function ModulesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [
    { data: modules },
    { data: progressRows },
    { data: profile },
  ] = await Promise.all([
    supabase.from("modules").select("*").eq("is_published", true).order("order_number"),
    supabase.from("user_progress").select("module_id, status, is_bookmarked").eq("user_id", user.id),
    supabase.from("users").select("current_plan").eq("id", user.id).single(),
  ])

  const progressMap = new Map(progressRows?.map((r) => [r.module_id, r]) ?? [])
  const module5Done =
    progressRows?.find(
      (r) => modules?.find((m) => m.order_number === 5)?.id === r.module_id && r.status === "completed"
    ) !== undefined

  const enrichedModules = (modules ?? []).map((m) => {
    const progress = progressMap.get(m.id)
    const status = (progress?.status as "not_started" | "in_progress" | "completed") ?? "not_started"
    const isBookmarked = progress?.is_bookmarked ?? false

    let isLocked = false
    let lockReason: string | null = null

    if (m.order_number >= 6 && !module5Done) {
      isLocked = true
      lockReason = "Selesaikan Modul 1–5 terlebih dahulu"
    } else if (m.order_number >= 2 && m.order_number <= 5) {
      const prevDone = progressRows?.find(
        (r) =>
          modules?.find((pm) => pm.order_number === m.order_number - 1)?.id === r.module_id &&
          r.status === "completed"
      )
      if (!prevDone) {
        isLocked = true
        lockReason = `Selesaikan Modul ${m.order_number - 1} terlebih dahulu`
      }
    }

    return { ...m, status, isLocked, lockReason, isBookmarked }
  })

  const currentPlan = profile?.current_plan ?? "free"

  return (
    <ModuleListClient
      modules={enrichedModules}
      currentPlan={currentPlan}
      userId={user.id}
    />
  )
}

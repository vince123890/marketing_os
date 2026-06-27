import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ModuleDetailClient from "@/components/modules/ModuleDetailClient"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: module }, { data: profile }] = await Promise.all([
    supabase
      .from("modules")
      .select("*, tasks(*)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single(),
    supabase.from("users").select("current_plan").eq("id", user.id).single(),
  ])

  if (!module) notFound()

  // Access check
  const currentPlan = profile?.current_plan ?? "free"
  if (module.order_number >= 6 && !["pro", "trial", "lifetime"].includes(currentPlan)) {
    redirect("/settings/subscription?reason=upgrade_required")
  }

  // Check sequential lock
  if (module.order_number > 1) {
    const { data: prevProgress } = await supabase
      .from("user_progress")
      .select("status")
      .eq("user_id", user.id)
      .eq("module_id",
        (await supabase.from("modules").select("id").eq("order_number", module.order_number - 1).single()).data?.id ?? ""
      )
      .single()

    if (!prevProgress || prevProgress.status !== "completed") {
      redirect(`/modules?locked=${module.order_number}`)
    }
  }

  // Mark as in_progress
  const { data: existingProgress } = await supabase
    .from("user_progress")
    .select("status, is_bookmarked")
    .eq("user_id", user.id)
    .eq("module_id", module.id)
    .maybeSingle()

  if (!existingProgress || existingProgress.status === "not_started") {
    await supabase.from("user_progress").upsert({
      user_id: user.id,
      module_id: module.id,
      status: "in_progress",
      started_at: new Date().toISOString(),
    }, { onConflict: "user_id,module_id" })
  }

  // Get submissions for first task
  const task = module.tasks?.[0]
  const { data: submissions } = task
    ? await supabase
        .from("task_submissions")
        .select("id, content, submitted_at, ai_feedback, score")
        .eq("user_id", user.id)
        .eq("task_id", task.id)
        .order("submitted_at", { ascending: false })
    : { data: [] }

  const hasSubmission = (submissions?.length ?? 0) > 0
  const isCompleted = existingProgress?.status === "completed"

  return (
    <ModuleDetailClient
      module={module}
      task={task ?? null}
      submissions={submissions ?? []}
      hasSubmission={hasSubmission}
      isCompleted={isCompleted}
      isBookmarked={existingProgress?.is_bookmarked ?? false}
      userId={user.id}
    />
  )
}

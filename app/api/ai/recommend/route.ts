import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { recommendNext } from "@/lib/gemini"
import { getUserGeminiKey } from "@/lib/ai-key"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const apiKey = await getUserGeminiKey(user.id)
  if (!apiKey) {
    return NextResponse.json({ message: "no_key" }, { status: 400 })
  }

  const [{ data: modules }, { data: progress }, { data: submissions }] = await Promise.all([
    supabase.from("modules").select("id, title").eq("is_published", true),
    supabase.from("user_progress").select("module_id, status").eq("user_id", user.id),
    supabase.from("task_submissions").select("module_id, score").eq("user_id", user.id),
  ])

  const moduleMap = new Map((modules ?? []).map((m) => [m.id, m.title]))
  const completedTitles = (progress ?? [])
    .filter((p) => p.status === "completed")
    .map((p) => moduleMap.get(p.module_id) ?? "")
    .filter(Boolean)
  const inProgressTitles = (progress ?? [])
    .filter((p) => p.status === "in_progress")
    .map((p) => moduleMap.get(p.module_id) ?? "")
    .filter(Boolean)

  // Best score per module, then average + weakest
  const bestByModule = new Map<string, number>()
  for (const s of submissions ?? []) {
    if (s.score === null) continue
    const prev = bestByModule.get(s.module_id)
    if (prev === undefined || s.score > prev) bestByModule.set(s.module_id, s.score)
  }
  const scores = [...bestByModule.values()]
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null
  let weakestModule: string | null = null
  let weakest = Infinity
  for (const [mid, score] of bestByModule) {
    if (score < weakest) {
      weakest = score
      weakestModule = moduleMap.get(mid) ?? null
    }
  }

  try {
    const recommendation = await recommendNext({
      apiKey,
      completedTitles,
      inProgressTitles,
      avgScore,
      weakestModule,
    })
    return NextResponse.json({ recommendation })
  } catch (e: unknown) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Gagal mendapat rekomendasi" },
      { status: 500 }
    )
  }
}

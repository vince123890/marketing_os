import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { toWIBDate } from "@/lib/utils"

const schema = z.object({
  module_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.errors[0].message }, { status: 400 })
  }

  const { module_id } = parsed.data

  // Verify user has at least one submission for any task in this module
  const { data: submissions } = await supabase
    .from("task_submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("module_id", module_id)
    .limit(1)

  if (!submissions?.length) {
    return NextResponse.json({ message: "Kerjakan task terlebih dahulu" }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: user.id,
        module_id,
        status: "completed",
        completed_at: now,
      },
      { onConflict: "user_id,module_id" }
    )

  if (error) return NextResponse.json({ message: "Gagal menyimpan progress" }, { status: 500 })

  // Update streak
  const today = toWIBDate()
  const { data: profile } = await supabase
    .from("users")
    .select("streak_count, last_active_date")
    .eq("id", user.id)
    .single()

  if (profile) {
    const lastDate = profile.last_active_date
    let newStreak = profile.streak_count ?? 0

    if (lastDate === null) {
      newStreak = 1
    } else {
      const last = new Date(lastDate)
      const todayDate = new Date(today)
      const diffDays = Math.round((todayDate.getTime() - last.getTime()) / 86400000)

      if (diffDays === 0) {
        // Same day, no change
      } else if (diffDays === 1) {
        newStreak += 1
      } else {
        newStreak = 1
      }
    }

    await supabase
      .from("users")
      .update({ streak_count: newStreak, last_active_date: today })
      .eq("id", user.id)
  }

  return NextResponse.json({ success: true })
}

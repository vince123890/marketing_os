import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { toWIBDate } from "@/lib/utils"

const schema = z.object({
  content: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: "Konten tidak valid" }, { status: 400 })
  }

  const today = toWIBDate()
  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(
      { user_id: user.id, log_date: today, content: parsed.data.content },
      { onConflict: "user_id,log_date" }
    )
    .select("id")
    .single()

  if (error) return NextResponse.json({ message: "Gagal menyimpan log" }, { status: 500 })

  // Update streak
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
        // Already counted today
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

  return NextResponse.json({ id: data.id })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { data } = await supabase
    .from("daily_logs")
    .select("id, log_date, content, created_at")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(30)

  return NextResponse.json({ logs: data ?? [] })
}

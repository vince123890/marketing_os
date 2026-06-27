import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({
  goal: z.string().min(1),
  daily_time_minutes: z.number().int().min(1),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 })
  }

  const { error } = await supabase
    .from("users")
    .update({
      learning_goal: parsed.data.goal,
      daily_time_minutes: parsed.data.daily_time_minutes,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (error) return NextResponse.json({ message: "Gagal menyimpan" }, { status: 500 })

  return NextResponse.json({ success: true })
}

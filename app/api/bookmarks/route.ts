import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

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
    return NextResponse.json({ message: "module_id tidak valid" }, { status: 400 })
  }

  const { module_id } = parsed.data

  // Get current state
  const { data: existing } = await supabase
    .from("user_progress")
    .select("is_bookmarked")
    .eq("user_id", user.id)
    .eq("module_id", module_id)
    .maybeSingle()

  const newBookmarked = !(existing?.is_bookmarked ?? false)

  const { error } = await supabase
    .from("user_progress")
    .upsert(
      { user_id: user.id, module_id, is_bookmarked: newBookmarked },
      { onConflict: "user_id,module_id" }
    )

  if (error) return NextResponse.json({ message: "Gagal mengubah bookmark" }, { status: 500 })

  return NextResponse.json({ bookmarked: newBookmarked })
}

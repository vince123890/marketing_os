import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({
  task_id: z.string().uuid(),
  content: z.string().min(50, "Minimal 50 karakter"),
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

  const { task_id, content } = parsed.data

  // Verify task exists
  const { data: task } = await supabase
    .from("tasks")
    .select("id, module_id, min_char_length")
    .eq("id", task_id)
    .single()

  if (!task) return NextResponse.json({ message: "Task tidak ditemukan" }, { status: 404 })

  if (content.length < (task.min_char_length ?? 50)) {
    return NextResponse.json({ message: `Minimal ${task.min_char_length} karakter` }, { status: 400 })
  }

  const { data: submission, error } = await supabase
    .from("task_submissions")
    .insert({
      user_id: user.id,
      task_id,
      module_id: task.module_id,
      content,
    })
    .select("id")
    .single()

  if (error) return NextResponse.json({ message: "Gagal menyimpan jawaban" }, { status: 500 })

  return NextResponse.json({ submission_id: submission.id })
}

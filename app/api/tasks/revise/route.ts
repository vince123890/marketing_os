import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { suggestRevision } from "@/lib/gemini"
import { getUserGeminiKey } from "@/lib/ai-key"
import { z } from "zod"

const schema = z.object({
  task_id: z.string().uuid(),
  content: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 })
  }

  const apiKey = await getUserGeminiKey(user.id)
  if (!apiKey) {
    return NextResponse.json(
      { message: "Aktifkan AI Coach dulu di menu untuk memakai fitur ini." },
      { status: 400 }
    )
  }

  const { data: task } = await supabase
    .from("tasks")
    .select("title, description, rubric")
    .eq("id", parsed.data.task_id)
    .single()

  if (!task) return NextResponse.json({ message: "Task tidak ditemukan" }, { status: 404 })

  try {
    const suggestion = await suggestRevision({
      apiKey,
      taskTitle: task.title,
      taskDescription: task.description,
      rubric: task.rubric,
      answer: parsed.data.content,
    })
    return NextResponse.json({ suggestion })
  } catch (e: unknown) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Gagal mendapat saran AI" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { z } from "zod"
import { generateTaskFeedback } from "@/lib/gemini"
import { decrypt } from "@/lib/crypto"

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
    return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 })
  }

  const { task_id, content } = parsed.data

  // Verify task exists
  const { data: task } = await supabase
    .from("tasks")
    .select("id, module_id, min_char_length, title, description, rubric")
    .eq("id", task_id)
    .single()

  if (!task) return NextResponse.json({ message: "Task tidak ditemukan" }, { status: 404 })

  if (content.length < (task.min_char_length ?? 50)) {
    return NextResponse.json({ message: `Minimal ${task.min_char_length} karakter` }, { status: 400 })
  }

  // Optional AI feedback (BYOK — key stored encrypted per user, decrypted server-side)
  let aiFeedback: string | null = null
  let aiScore: number | null = null
  let aiError: string | null = null

  const { data: keyRow } = await createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
    .from("users")
    .select("gemini_api_key_encrypted")
    .eq("id", user.id)
    .single()

  if (keyRow?.gemini_api_key_encrypted) {
    try {
      const apiKey = decrypt(keyRow.gemini_api_key_encrypted)
      const result = await generateTaskFeedback({
        apiKey,
        taskTitle: task.title,
        taskDescription: task.description,
        rubric: task.rubric,
        answer: content,
      })
      aiFeedback = result.feedback
      aiScore = result.score
    } catch (e: unknown) {
      // Don't block submission if AI fails — just report it
      aiError = e instanceof Error ? e.message : "AI feedback gagal"
    }
  }

  const { data: submission, error } = await supabase
    .from("task_submissions")
    .insert({
      user_id: user.id,
      task_id,
      module_id: task.module_id,
      content,
      ai_feedback: aiFeedback,
      score: aiScore,
    })
    .select("id")
    .single()

  if (error) return NextResponse.json({ message: "Gagal menyimpan jawaban" }, { status: 500 })

  return NextResponse.json({
    submission_id: submission.id,
    ai_feedback: aiFeedback,
    score: aiScore,
    ai_error: aiError,
  })
}

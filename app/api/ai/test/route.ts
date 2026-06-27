import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateTaskFeedback } from "@/lib/gemini"
import { z } from "zod"

const schema = z.object({ api_key: z.string().min(1) })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ message: "API key diperlukan" }, { status: 400 })
  }

  try {
    await generateTaskFeedback({
      apiKey: parsed.data.api_key,
      taskTitle: "Tes Koneksi",
      taskDescription: "Ini adalah tes untuk memvalidasi API key.",
      rubric: "Balas dengan skor 100.",
      answer: "Halo, ini tes koneksi API key Gemini untuk memastikan key berfungsi dengan baik.",
    })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Key tidak valid"
    return NextResponse.json({ message: msg }, { status: 400 })
  }
}

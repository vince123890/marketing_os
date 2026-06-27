import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { summarizeModule } from "@/lib/gemini"
import { getUserGeminiKey } from "@/lib/ai-key"
import { z } from "zod"

const schema = z.object({ module_id: z.string().uuid() })

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

  const { data: module } = await supabase
    .from("modules")
    .select("title, content_markdown")
    .eq("id", parsed.data.module_id)
    .eq("is_published", true)
    .single()

  if (!module) return NextResponse.json({ message: "Modul tidak ditemukan" }, { status: 404 })

  try {
    const summary = await summarizeModule({
      apiKey,
      moduleTitle: module.title,
      content: module.content_markdown,
    })
    return NextResponse.json({ summary })
  } catch (e: unknown) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Gagal merangkum modul" },
      { status: 500 }
    )
  }
}

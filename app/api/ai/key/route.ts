import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { encrypt } from "@/lib/crypto"
import { generateTaskFeedback } from "@/lib/gemini"
import { z } from "zod"

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — whether the current user has a saved key (never returns the key itself)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { data } = await serviceClient()
    .from("users")
    .select("gemini_api_key_encrypted")
    .eq("id", user.id)
    .single()

  return NextResponse.json({ has_key: !!data?.gemini_api_key_encrypted })
}

// POST — validate then store the key (encrypted)
const postSchema = z.object({ api_key: z.string().min(10) })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const parsed = postSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ message: "API key tidak valid" }, { status: 400 })
  }

  // Validate the key works before saving
  try {
    await generateTaskFeedback({
      apiKey: parsed.data.api_key,
      taskTitle: "Tes Koneksi",
      taskDescription: "Validasi API key.",
      rubric: "Balas dengan skor 100.",
      answer: "Tes koneksi API key Gemini untuk memastikan key berfungsi dengan baik.",
    })
  } catch (e: unknown) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Key tidak valid" },
      { status: 400 }
    )
  }

  const encrypted = encrypt(parsed.data.api_key)
  const { error } = await serviceClient()
    .from("users")
    .update({ gemini_api_key_encrypted: encrypted })
    .eq("id", user.id)

  if (error) return NextResponse.json({ message: "Gagal menyimpan key" }, { status: 500 })

  return NextResponse.json({ ok: true })
}

// DELETE — remove the saved key
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { error } = await serviceClient()
    .from("users")
    .update({ gemini_api_key_encrypted: null })
    .eq("id", user.id)

  if (error) return NextResponse.json({ message: "Gagal menghapus key" }, { status: 500 })

  return NextResponse.json({ ok: true })
}

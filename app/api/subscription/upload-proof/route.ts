import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"]
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const orderId = formData.get("order_id") as string | null

  if (!file || !orderId) {
    return NextResponse.json({ message: "File dan order_id diperlukan" }, { status: 400 })
  }

  // Validate MIME type
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ message: "Format file harus JPG, PNG, atau WebP" }, { status: 400 })
  }

  // Validate size
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "Ukuran file maksimal 5MB" }, { status: 400 })
  }

  // Verify order belongs to user and is in correct state
  const { data: order } = await supabase
    .from("subscription_orders")
    .select("id, status, user_id")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .in("status", ["pending_payment", "proof_rejected"])
    .single()

  if (!order) {
    return NextResponse.json({ message: "Order tidak ditemukan atau tidak valid" }, { status: 404 })
  }

  // Sanitize filename
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const storagePath = `${user.id}/${orderId}/${Date.now()}.${ext}`

  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ message: "Gagal mengunggah file" }, { status: 500 })
  }

  // Create proof record
  const { error: proofError } = await supabase
    .from("payment_proofs")
    .insert({
      order_id: orderId,
      user_id: user.id,
      storage_path: storagePath,
      status: "pending_verification",
    })

  if (proofError) {
    return NextResponse.json({ message: "Gagal menyimpan bukti" }, { status: 500 })
  }

  // Update order status
  await supabase
    .from("subscription_orders")
    .update({ status: "waiting_verification" })
    .eq("id", orderId)

  return NextResponse.json({ success: true })
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Returns orders awaiting verification, with a signed URL for each proof image.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  // Pending proofs joined with their order + buyer
  const { data: proofs } = await supabase
    .from("payment_proofs")
    .select("id, order_id, user_id, storage_path, status, uploaded_at")
    .eq("status", "pending_verification")
    .order("uploaded_at", { ascending: true })

  const rows = proofs ?? []
  const orderIds = rows.map((p) => p.order_id)
  const userIds = rows.map((p) => p.user_id)

  const [{ data: orders }, { data: buyers }] = await Promise.all([
    orderIds.length
      ? supabase
          .from("subscription_orders")
          .select("id, plan, amount, status, created_at")
          .in("id", orderIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase.from("users").select("id, name, email").in("id", userIds)
      : Promise.resolve({ data: [] }),
  ])

  const orderMap = new Map((orders ?? []).map((o) => [o.id, o]))
  const buyerMap = new Map((buyers ?? []).map((b) => [b.id, b]))

  const result = await Promise.all(
    rows.map(async (p) => {
      const { data: signed } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(p.storage_path, 60 * 10) // 10 min

      const order = orderMap.get(p.order_id)
      const buyer = buyerMap.get(p.user_id)

      return {
        proof_id: p.id,
        order_id: p.order_id,
        uploaded_at: p.uploaded_at,
        proof_url: signed?.signedUrl ?? null,
        plan: order?.plan ?? "-",
        amount: order?.amount ?? 0,
        buyer_name: buyer?.name ?? "-",
        buyer_email: buyer?.email ?? "-",
      }
    })
  )

  return NextResponse.json({ orders: result })
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { z } from "zod"

const schema = z.object({
  proof_id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  rejection_reason: z.string().optional(),
})

// This endpoint requires SUPABASE_SERVICE_ROLE_KEY for subscription activation
// Admin-only: verified server-side via is_admin flag
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  // Verify admin
  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 })
  }

  const { proof_id, action, rejection_reason } = parsed.data

  // Get proof with order info
  const { data: proof } = await supabase
    .from("payment_proofs")
    .select("id, order_id, user_id, status")
    .eq("id", proof_id)
    .eq("status", "pending_verification")
    .single()

  if (!proof) {
    return NextResponse.json({ message: "Proof tidak ditemukan atau sudah diproses" }, { status: 404 })
  }

  const { data: order } = await supabase
    .from("subscription_orders")
    .select("id, plan, user_id")
    .eq("id", proof.order_id)
    .single()

  if (!order) {
    return NextResponse.json({ message: "Order tidak ditemukan" }, { status: 404 })
  }

  const now = new Date().toISOString()

  if (action === "reject") {
    await supabase
      .from("payment_proofs")
      .update({ status: "rejected", rejection_reason, reviewed_at: now, reviewed_by: user.id })
      .eq("id", proof_id)

    await supabase
      .from("subscription_orders")
      .update({ status: "proof_rejected" })
      .eq("id", order.id)

    return NextResponse.json({ success: true, action: "rejected" })
  }

  // Approve: use service role to activate subscription
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Mark proof verified
  await serviceSupabase
    .from("payment_proofs")
    .update({ status: "verified", reviewed_at: now, reviewed_by: user.id })
    .eq("id", proof_id)

  // Mark order paid
  await serviceSupabase
    .from("subscription_orders")
    .update({ status: "paid", paid_at: now })
    .eq("id", order.id)

  // Activate subscription
  const plan = order.plan === "lifetime" ? "lifetime" : "pro"
  const periodEnd =
    order.plan === "lifetime"
      ? null
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await serviceSupabase.from("subscriptions").insert({
    user_id: order.user_id,
    plan,
    period_start: now,
    period_end: periodEnd,
    is_active: true,
  })

  // Update user plan
  await serviceSupabase
    .from("users")
    .update({ current_plan: plan })
    .eq("id", order.user_id)

  return NextResponse.json({ success: true, action: "approved" })
}

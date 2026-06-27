import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { generateOrderId } from "@/lib/utils"

const BANK_CONFIG = {
  bank_name: "BCA",
  bank_account: "1234567890",
  account_holder: "MarketingOS",
}

const PRICES: Record<string, number> = {
  pro_monthly: 99000,
  lifetime: 499000,
}

const schema = z.object({
  plan: z.enum(["pro_monthly", "lifetime"]),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: "Plan tidak valid" }, { status: 400 })
  }

  const { plan } = parsed.data

  // Idempotency: check existing pending order for same plan
  const { data: existing } = await supabase
    .from("subscription_orders")
    .select("id, bank_name, bank_account, amount, expires_at")
    .eq("user_id", user.id)
    .eq("plan", plan)
    .eq("status", "pending_payment")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({
      id: existing.id,
      bank_name: existing.bank_name,
      bank_account: existing.bank_account,
      amount: existing.amount,
      expires_at: existing.expires_at,
    })
  }

  const orderId = generateOrderId(user.id)
  const amount = PRICES[plan]
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h

  const { data: order, error } = await supabase
    .from("subscription_orders")
    .insert({
      id: orderId,
      user_id: user.id,
      plan,
      amount,
      status: "pending_payment",
      bank_name: BANK_CONFIG.bank_name,
      bank_account: BANK_CONFIG.bank_account,
      expires_at: expiresAt,
    })
    .select("id, bank_name, bank_account, amount, expires_at")
    .single()

  if (error) return NextResponse.json({ message: "Gagal membuat order" }, { status: 500 })

  return NextResponse.json(order)
}

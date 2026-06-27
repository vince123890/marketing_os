import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SubscriptionClient from "@/components/subscription/SubscriptionClient"

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: activeOrder }] = await Promise.all([
    supabase
      .from("users")
      .select("name, email, current_plan")
      .eq("id", user.id)
      .single(),
    supabase
      .from("subscription_orders")
      .select("id, plan, amount, status, bank_name, bank_account, expires_at, created_at")
      .eq("user_id", user.id)
      .in("status", ["pending_payment", "waiting_verification", "proof_rejected"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const { data: proofRow } = activeOrder
    ? await supabase
        .from("payment_proofs")
        .select("id, status, rejection_reason, uploaded_at")
        .eq("order_id", activeOrder.id)
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  return (
    <SubscriptionClient
      currentPlan={profile?.current_plan ?? "free"}
      activeOrder={activeOrder ?? null}
      latestProof={proofRow ?? null}
    />
  )
}

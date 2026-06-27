import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import WelcomeClient from "@/components/welcome/WelcomeClient"

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("name, onboarding_completed")
    .eq("id", user.id)
    .single()

  if (profile?.onboarding_completed) redirect("/dashboard")

  return <WelcomeClient name={profile?.name ?? "Marketer"} />
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/layout/Sidebar"
import MobileNav from "@/components/layout/MobileNav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const [{ data: profile }, { data: progressRows }] = await Promise.all([
    supabase.from("users").select("name, email, streak_count, current_plan, is_admin").eq("id", user.id).single(),
    supabase.from("user_progress").select("status").eq("user_id", user.id).eq("status", "completed"),
  ])

  const completed = progressRows?.length ?? 0
  const percentage = Math.round((completed / 19) * 100)

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar
        user={{
          name: profile?.name ?? user.email ?? "User",
          email: profile?.email ?? user.email ?? "",
          streak_count: profile?.streak_count ?? 0,
          current_plan: profile?.current_plan ?? "free",
          is_admin: profile?.is_admin ?? false,
        }}
        progress={{ completed, percentage }}
      />

      {/* Main content area — offset for sidebar on desktop */}
      <main className="lg:pl-[240px] pb-20 lg:pb-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl">{children}</div>
      </main>

      <MobileNav />
    </div>
  )
}

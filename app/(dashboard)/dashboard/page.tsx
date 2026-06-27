import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { toWIBDate } from "@/lib/utils"
import ReEngagementBanner from "@/components/dashboard/ReEngagementBanner"
import ProgressCard from "@/components/dashboard/ProgressCard"
import StreakCard from "@/components/dashboard/StreakCard"
import DailyLogWidget from "@/components/dashboard/DailyLogWidget"
import ModuleCard from "@/components/modules/ModuleCard"
import { differenceInDays } from "date-fns"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [
    { data: profile },
    { data: progressRows },
    { data: todayLog },
    { data: recentModules },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("name, streak_count, last_active_date, current_plan, onboarding_completed")
      .eq("id", user.id)
      .single(),
    supabase.from("user_progress").select("module_id, status").eq("user_id", user.id),
    supabase
      .from("daily_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", toWIBDate())
      .maybeSingle(),
    supabase
      .from("user_progress")
      .select("module_id, status, started_at, modules(id, order_number, title, slug)")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(4),
  ])

  if (profile && !profile.onboarding_completed) {
    redirect("/welcome")
  }

  const completed = progressRows?.filter((r) => r.status === "completed").length ?? 0
  const percentage = Math.round((completed / 19) * 100)

  const daysInactive = profile?.last_active_date
    ? differenceInDays(new Date(), new Date(profile.last_active_date))
    : 0
  const showBanner = daysInactive > 2

  const lastModule = recentModules?.[0]?.modules as { id: string; order_number: number; title: string; slug: string } | null ?? null

  return (
    <div className="space-y-6 animate-fade-in">
      {showBanner && lastModule && (
        <ReEngagementBanner
          moduleName={lastModule.title}
          moduleSlug={lastModule.slug}
          daysInactive={daysInactive}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Halo, {profile?.name?.split(" ")[0] ?? "kamu"}! 👋
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {todayLog ? "Kamu sudah buat log hari ini. Keep it up!" : "Lanjutkan belajar marketingmu hari ini."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProgressCard completed={completed} total={19} percentage={percentage} />
        <StreakCard streakCount={profile?.streak_count ?? 0} hasLogToday={!!todayLog} />
      </div>

      {lastModule && (
        <div>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Lanjutkan Belajar
          </h2>
          <ModuleCard
            module={lastModule}
            status={(recentModules?.[0]?.status as "not_started" | "in_progress" | "completed") ?? "not_started"}
            isLocked={false}
            lockReason={null}
            isBookmarked={false}
            currentPlan={profile?.current_plan ?? "free"}
          />
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Daily Log Hari Ini
        </h2>
        <DailyLogWidget userId={user.id} hasLogToday={!!todayLog} />
      </div>
    </div>
  )
}

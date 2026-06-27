import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DailyLogClient from "@/components/daily-log/DailyLogClient"
import { toWIBDate } from "@/lib/utils"

export default async function DailyLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const today = toWIBDate()

  const { data: logs } = await supabase
    .from("daily_logs")
    .select("id, log_date, content, created_at")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(30)

  const todayLog = logs?.find((l) => l.log_date === today) ?? null

  return (
    <div className="max-w-[720px] animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Daily Log</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Catat refleksi harian kamu — apa yang dipelajari, diterapkan, atau direncanakan.
        </p>
      </div>
      <DailyLogClient logs={logs ?? []} todayLog={todayLog} today={today} />
    </div>
  )
}

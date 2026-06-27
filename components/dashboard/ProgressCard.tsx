import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface ProgressCardProps {
  completed: number
  total: number
  percentage: number
}

export default function ProgressCard({ completed, total, percentage }: ProgressCardProps) {
  const isDone = percentage === 100

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-600">Progress Belajar</p>
        {isDone && <CheckCircle size={18} className="text-success-500" />}
      </div>

      <div className="flex items-end gap-3 mb-3">
        <span className="text-3xl font-bold text-neutral-800">{percentage}%</span>
        <span className="text-sm text-neutral-400 mb-1">{completed}/{total} modul</span>
      </div>

      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isDone ? "bg-success-500" : percentage >= 67 ? "bg-brand-600" : "bg-brand-500"
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <p className="text-xs text-neutral-400 mt-2">
        {isDone
          ? "Selamat! Kamu sudah menyelesaikan semua modul 🎉"
          : `${total - completed} modul lagi untuk selesai`}
      </p>
    </div>
  )
}

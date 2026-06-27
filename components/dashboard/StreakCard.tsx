"use client"

import { cn, getStreakColor, getStreakLabel } from "@/lib/utils"
import { Flame } from "lucide-react"

interface StreakCardProps {
  streakCount: number
  hasLogToday: boolean
}

export default function StreakCard({ streakCount, hasLogToday }: StreakCardProps) {
  const label = getStreakLabel(streakCount)

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-600">Streak Belajar</p>
        {label && (
          <span className="text-xs font-semibold bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full">
            {label}
          </span>
        )}
      </div>

      <div className="flex items-end gap-2 mb-3">
        <Flame
          size={28}
          className={cn(
            "transition-colors",
            streakCount === 0 ? "text-neutral-300" : getStreakColor(streakCount)
          )}
        />
        <span className={cn("text-3xl font-bold", streakCount === 0 ? "text-neutral-400" : "text-neutral-800")}>
          {streakCount}
        </span>
        <span className="text-sm text-neutral-400 mb-1">
          {streakCount === 1 ? "hari" : "hari berturut"}
        </span>
      </div>

      {/* Last 7 days dots */}
      <div className="flex gap-1.5 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-5 h-5 rounded-full",
              i < Math.min(streakCount, 7)
                ? streakCount >= 15
                  ? "bg-purple-500"
                  : streakCount >= 8
                    ? "bg-red-500"
                    : "bg-orange-400"
                : "bg-neutral-200"
            )}
          />
        ))}
      </div>

      <p className="text-xs text-neutral-400">
        {hasLogToday
          ? "Log hari ini sudah dibuat ✓"
          : "Buat daily log untuk menjaga streak"}
      </p>
    </div>
  )
}

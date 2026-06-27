"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Lock,
  CheckCircle,
  BookOpen,
  Circle,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Star,
} from "lucide-react"
import type { ModuleStatus } from "@/types/database"

interface ModuleCardProps {
  module: {
    id: string
    order_number: number
    title: string
    slug: string
  }
  status: ModuleStatus
  isLocked: boolean
  lockReason: string | null
  isBookmarked: boolean
  currentPlan: string
  onBookmarkToggle?: (moduleId: string) => void
}

const statusConfig = {
  not_started: {
    icon: Circle,
    badge: "Belum Dimulai",
    badgeClass: "badge-not-started",
    iconClass: "text-neutral-300",
    borderClass: "border-neutral-200",
    numberClass: "bg-neutral-100 text-neutral-500",
  },
  in_progress: {
    icon: BookOpen,
    badge: "Sedang Dipelajari",
    badgeClass: "badge-in-progress",
    iconClass: "text-brand-500",
    borderClass: "border-brand-200",
    numberClass: "bg-brand-100 text-brand-700",
  },
  completed: {
    icon: CheckCircle,
    badge: "Selesai",
    badgeClass: "badge-completed",
    iconClass: "text-success-500",
    borderClass: "border-success-200",
    numberClass: "bg-success-100 text-success-700",
  },
}

export default function ModuleCard({
  module,
  status,
  isLocked,
  lockReason,
  isBookmarked,
  currentPlan,
  onBookmarkToggle,
}: ModuleCardProps) {
  const isUpgradeRequired =
    module.order_number >= 6 && !["pro", "trial", "lifetime"].includes(currentPlan)
  const config = statusConfig[status] ?? statusConfig.not_started
  const StatusIcon = config.icon

  if (isLocked && !isUpgradeRequired) {
    return (
      <div className="card-base p-4 opacity-60 cursor-not-allowed select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-neutral-400">{module.order_number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-neutral-500 truncate">{module.title}</p>
              <Lock size={14} className="text-neutral-400 flex-shrink-0" />
            </div>
            {lockReason && (
              <p className="text-xs text-neutral-400 mt-0.5">{lockReason}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isUpgradeRequired) {
    return (
      <div className="card-base p-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0", config.numberClass)}>
            <span className="text-sm font-bold">{module.order_number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-700 truncate">{module.title}</p>
            <p className="text-xs text-neutral-400 mt-0.5">Eksklusif plan PRO</p>
          </div>
          <Link
            href="/settings/subscription"
            className="flex-shrink-0 flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            <Star size={12} />
            PRO
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Link href={`/modules/${module.slug}`} className="block group">
      <div
        className={cn(
          "card-base card-hover p-4 border",
          status === "in_progress" ? "border-brand-200" : status === "completed" ? "border-success-200" : "border-neutral-200"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 font-bold text-sm", config.numberClass)}>
            {status === "completed" ? <CheckCircle size={18} /> : module.order_number}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-neutral-800 truncate group-hover:text-brand-600 transition-colors">
                {module.title}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusIcon size={12} className={config.iconClass} />
              <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", config.badgeClass)}>
                {config.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onBookmarkToggle && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onBookmarkToggle(module.id)
                }}
                className="text-neutral-300 hover:text-brand-500 transition-colors"
                aria-label={isBookmarked ? "Hapus bookmark" : "Tambah bookmark"}
              >
                {isBookmarked ? (
                  <BookmarkCheck size={16} className="text-brand-500" />
                ) : (
                  <Bookmark size={16} />
                )}
              </button>
            )}
            <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-500 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}

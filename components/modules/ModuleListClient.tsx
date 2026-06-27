"use client"

import { useState } from "react"
import { toast } from "sonner"
import ModuleCard from "./ModuleCard"
import type { ModuleStatus } from "@/types/database"

interface Module {
  id: string
  order_number: number
  title: string
  slug: string
  status: ModuleStatus
  isLocked: boolean
  lockReason: string | null
  isBookmarked: boolean
}

interface ModuleListClientProps {
  modules: Module[]
  currentPlan: string
  userId: string
}

export default function ModuleListClient({ modules, currentPlan, userId }: ModuleListClientProps) {
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(
    Object.fromEntries(modules.map((m) => [m.id, m.isBookmarked]))
  )

  async function handleBookmarkToggle(moduleId: string) {
    const prev = bookmarks[moduleId]
    setBookmarks((b) => ({ ...b, [moduleId]: !prev }))

    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: moduleId }),
    })

    if (!res.ok) {
      setBookmarks((b) => ({ ...b, [moduleId]: prev }))
      toast.error("Gagal mengubah bookmark")
    } else {
      toast.success(prev ? "Bookmark dihapus" : "Modul disimpan")
    }
  }

  const sequential = modules.filter((m) => m.order_number <= 5)
  const free = modules.filter((m) => m.order_number >= 6)
  const completed = modules.filter((m) => m.status === "completed").length
  const percentage = Math.round((completed / 19) * 100)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">19 Modul Marketing</h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-neutral-500 flex-shrink-0">
            {completed}/19 selesai ({percentage}%)
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Modul 1–5 — Wajib Berurutan
          </span>
          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">Sequential</span>
        </div>
        <div className="space-y-2">
          {sequential.map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              status={m.status}
              isLocked={m.isLocked}
              lockReason={m.lockReason}
              isBookmarked={bookmarks[m.id] ?? false}
              currentPlan={currentPlan}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Modul 6–19 — Bebas Pilih
          </span>
          {currentPlan === "free" && (
            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
              PRO
            </span>
          )}
        </div>
        <div className="space-y-2">
          {free.map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              status={m.status}
              isLocked={m.isLocked}
              lockReason={m.lockReason}
              isBookmarked={bookmarks[m.id] ?? false}
              currentPlan={currentPlan}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

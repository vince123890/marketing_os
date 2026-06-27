"use client"

import { useState } from "react"
import Link from "next/link"
import { X, ArrowRight } from "lucide-react"

interface ReEngagementBannerProps {
  moduleName: string
  moduleSlug: string
  daysInactive: number
}

export default function ReEngagementBanner({
  moduleName,
  moduleSlug,
  daysInactive,
}: ReEngagementBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="flex items-center justify-between gap-3 p-4 bg-warning-50 border-l-4 border-warning-500 rounded-r-lg animate-slide-down">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-warning-800">
          👋 Selamat datang kembali!
        </p>
        <p className="text-xs text-warning-700 mt-0.5">
          Sudah {daysInactive} hari tidak belajar.{" "}
          <Link
            href={`/modules/${moduleSlug}`}
            className="font-medium underline hover:text-warning-900"
          >
            Lanjutkan: {moduleName}
          </Link>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/modules/${moduleSlug}`}
          className="text-warning-700 hover:text-warning-900"
          aria-label="Pergi ke modul"
        >
          <ArrowRight size={16} />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-warning-500 hover:text-warning-700"
          aria-label="Tutup banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

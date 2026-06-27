"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"

export default function AIRecommendation() {
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [noKey, setNoKey] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/recommend")
      const data = await res.json()
      if (res.status === 400 && data.message === "no_key") {
        setNoKey(true)
        return
      }
      if (!res.ok) throw new Error(data.message)
      setRecommendation(data.recommendation)
    } catch {
      setRecommendation("Gagal memuat rekomendasi. Coba lagi nanti.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-base p-5 bg-gradient-to-br from-brand-50 to-white border border-brand-100">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-brand-500" />
        <h2 className="text-sm font-semibold text-neutral-700">Rekomendasi AI Coach</h2>
      </div>

      {noKey ? (
        <p className="text-xs text-neutral-500">
          Aktifkan AI Coach di menu <strong>AI Coach</strong> untuk mendapat rekomendasi belajar personal.
        </p>
      ) : recommendation ? (
        <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{recommendation}</p>
      ) : (
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 disabled:text-neutral-300 transition-colors"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Menganalisis progressmu...</>
          ) : (
            <><Sparkles size={14} /> Minta saran langkah berikutnya</>
          )}
        </button>
      )}
    </div>
  )
}

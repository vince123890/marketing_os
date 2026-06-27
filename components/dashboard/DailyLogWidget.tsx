"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface DailyLogWidgetProps {
  userId: string
  hasLogToday: boolean
}

export default function DailyLogWidget({ hasLogToday }: DailyLogWidgetProps) {
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(hasLogToday)

  async function handleSave() {
    if (!note.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSaved(true)
      toast.success("Log hari ini tersimpan! 🔥")
    } catch {
      toast.error("Gagal menyimpan log. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  if (saved) {
    return (
      <div className="card-base p-4 flex items-center gap-3">
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-sm font-semibold text-neutral-700">Log hari ini sudah dibuat!</p>
          <p className="text-xs text-neutral-400">Kembali lagi besok untuk menjaga streak.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-base p-4 space-y-3">
      <Textarea
        placeholder="Apa yang kamu pelajari atau kerjakan hari ini?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-[80px] resize-none text-sm"
      />
      <Button
        onClick={handleSave}
        disabled={!note.trim() || loading}
        className="bg-brand-500 hover:bg-brand-600 text-white h-9 text-sm"
      >
        {loading ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : "Simpan Log"}
      </Button>
    </div>
  )
}

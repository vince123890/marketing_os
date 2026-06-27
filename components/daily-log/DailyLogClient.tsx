"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, BookOpen, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn, formatDateID } from "@/lib/utils"

interface DailyLog {
  id: string
  log_date: string
  content: string
  created_at: string
}

interface Props {
  logs: DailyLog[]
  todayLog: DailyLog | null
  today: string
}

export default function DailyLogClient({ logs, todayLog, today }: Props) {
  const [content, setContent] = useState(todayLog?.content ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!todayLog)
  const [localLogs, setLocalLogs] = useState<DailyLog[]>(logs)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function handleSave() {
    if (!content.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error()

      setSaved(true)
      setEditingId(null)

      // Update local logs
      setLocalLogs((prev) => {
        const existing = prev.find((l) => l.log_date === today)
        if (existing) {
          return prev.map((l) => l.log_date === today ? { ...l, content } : l)
        }
        return [{ id: Date.now().toString(), log_date: today, content, created_at: new Date().toISOString() }, ...prev]
      })

      toast.success("Log harian tersimpan!")
    } catch {
      toast.error("Gagal menyimpan log. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  const todayInLogs = localLogs.find((l) => l.log_date === today)
  const pastLogs = localLogs.filter((l) => l.log_date !== today)

  return (
    <div className="space-y-6">
      {/* Today's log */}
      <div className="card-base p-5 border border-brand-200 bg-brand-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Edit3 size={16} className="text-brand-500" />
            <span className="text-sm font-semibold text-neutral-700">Hari Ini</span>
          </div>
          <span className="text-xs text-neutral-400">
            {format(new Date(today), "EEEE, d MMMM yyyy", { locale: id })}
          </span>
        </div>

        {saved && editingId !== "today" ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {todayInLogs?.content ?? content}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setContent(todayInLogs?.content ?? content)
                setEditingId("today")
                setSaved(false)
              }}
              className="text-xs h-7"
            >
              Edit Log
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="Apa yang kamu pelajari atau terapkan hari ini? Refleksi singkat pun oke..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-y text-sm leading-relaxed"
              autoFocus={editingId === "today"}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">{content.length} karakter</span>
              <Button
                onClick={handleSave}
                disabled={!content.trim() || saving}
                className="h-8 text-xs bg-brand-500 hover:bg-brand-600 text-white"
              >
                {saving ? <><Loader2 size={12} className="animate-spin" /> Menyimpan...</> : "Simpan Log"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Past logs */}
      {pastLogs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} className="text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-500">Log Sebelumnya</h2>
          </div>
          <div className="space-y-3">
            {pastLogs.map((log) => (
              <div key={log.id} className="card-base p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-neutral-500">
                    {formatDateID(log.log_date)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{log.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {localLogs.length === 0 && (
        <div className="text-center py-10 text-neutral-400">
          <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Belum ada log. Mulai tulis refleksi harianmu!</p>
        </div>
      )}
    </div>
  )
}

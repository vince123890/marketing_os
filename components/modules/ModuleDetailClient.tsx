"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ChevronLeft, Bookmark, BookmarkCheck, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn, truncate } from "@/lib/utils"
import { renderMarkdown } from "@/lib/markdown"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Submission {
  id: string
  content: string
  submitted_at: string
  ai_feedback: string | null
  score: number | null
}

interface ModuleDetailClientProps {
  module: {
    id: string
    order_number: number
    title: string
    content_markdown: string
    key_takeaway: string
  }
  task: {
    id: string
    title: string
    description: string
    rubric: string
    min_char_length: number
  } | null
  submissions: Submission[]
  hasSubmission: boolean
  isCompleted: boolean
  isBookmarked: boolean
  userId: string
}

const MIN_CHARS = 50

export default function ModuleDetailClient({
  module,
  task,
  submissions,
  hasSubmission: initialHasSubmission,
  isCompleted: initialIsCompleted,
  isBookmarked: initialBookmarked,
}: ModuleDetailClientProps) {
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [hasSubmission, setHasSubmission] = useState(initialHasSubmission)
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [localSubmissions, setLocalSubmissions] = useState<Submission[]>(submissions)

  const charCount = answer.length
  const canSubmit = charCount >= MIN_CHARS

  async function handleSubmitTask() {
    if (!task || !canSubmit) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: task.id, content: answer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setHasSubmission(true)
      setLocalSubmissions([
        {
          id: data.submission_id,
          content: answer,
          submitted_at: new Date().toISOString(),
          ai_feedback: data.ai_feedback ?? null,
          score: data.score ?? null,
        },
        ...localSubmissions,
      ])
      setAnswer("")

      if (data.score !== null && data.score !== undefined) {
        toast.success(`Jawaban dinilai AI — skor ${data.score}/100 🤖`)
      } else if (data.ai_error) {
        toast.warning(`Jawaban disimpan, tapi AI feedback gagal: ${data.ai_error}`)
      } else {
        toast.success("Jawaban disimpan! (Aktifkan AI Coach di menu untuk feedback otomatis)")
      }
    } catch {
      toast.error("Gagal menyimpan jawaban. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMarkComplete() {
    if (!hasSubmission) return
    setCompleting(true)
    try {
      const res = await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module_id: module.id }),
      })
      if (!res.ok) throw new Error()
      setIsCompleted(true)
      toast.success("Modul ditandai selesai! 🎉")
    } catch {
      toast.error("Gagal menandai selesai. Coba lagi.")
    } finally {
      setCompleting(false)
    }
  }

  async function handleBookmarkToggle() {
    const prev = isBookmarked
    setIsBookmarked(!prev)
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: module.id }),
    })
    if (!res.ok) {
      setIsBookmarked(prev)
      toast.error("Gagal mengubah bookmark")
    } else {
      toast.success(prev ? "Bookmark dihapus" : "Modul disimpan")
    }
  }

  return (
    <div className="max-w-[768px] animate-fade-in">
      {/* Back */}
      <Link href="/modules" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors">
        <ChevronLeft size={16} />
        Kembali ke Daftar Modul
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-1">
            Modul {module.order_number} dari 19
          </p>
          <h1 className="text-2xl font-bold text-neutral-800">{module.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-1 rounded-full">
              <CheckCircle size={12} />
              Selesai
            </span>
          )}
          <button
            onClick={handleBookmarkToggle}
            className="text-neutral-300 hover:text-brand-500 transition-colors p-1"
            aria-label={isBookmarked ? "Hapus bookmark" : "Simpan modul"}
          >
            {isBookmarked ? <BookmarkCheck size={20} className="text-brand-500" /> : <Bookmark size={20} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="module-content text-neutral-700 leading-relaxed text-base mb-8"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(module.content_markdown) }}
      />

      {/* Key Takeaway */}
      {module.key_takeaway && (
        <div className="bg-brand-50 border-l-4 border-brand-500 rounded-r-lg p-4 mb-8">
          <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1">💡 Key Takeaway</p>
          <p className="text-sm text-brand-800">{module.key_takeaway}</p>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-neutral-200 my-8" />

      {/* Task */}
      {task && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">✍️ Task Praktek</h2>
            <h3 className="text-base font-semibold text-neutral-700 mt-1">{task.title}</h3>
          </div>

          <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
            {task.description}
          </div>

          {task.rubric && (
            <details className="text-sm">
              <summary className="cursor-pointer text-brand-600 hover:text-brand-700 font-medium select-none">
                Lihat Rubrik Penilaian
              </summary>
              <div className="mt-2 p-3 bg-neutral-50 rounded-lg text-neutral-600 text-xs whitespace-pre-wrap leading-relaxed">
                {task.rubric}
              </div>
            </details>
          )}

          {/* Answer textarea */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">Jawaban Kamu</label>
            <Textarea
              placeholder="Tulis jawaban task kamu di sini... (minimal 50 karakter)"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[140px] resize-y text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs font-medium",
                  charCount < MIN_CHARS ? "text-danger-500" : "text-success-600"
                )}
              >
                {charCount} / {MIN_CHARS} karakter minimum
              </span>
              <Button
                onClick={handleSubmitTask}
                disabled={!canSubmit || submitting}
                className={cn(
                  "h-9 text-sm",
                  canSubmit
                    ? "bg-brand-500 hover:bg-brand-600 text-white"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                )}
              >
                {submitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                ) : (
                  "Submit Jawaban"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submission history */}
      {localSubmissions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-600 mb-3">
            Riwayat Submission ({localSubmissions.length})
          </h3>
          <div className="space-y-2">
            {localSubmissions.map((sub) => (
              <div key={sub.id} className="card-base p-3 text-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-neutral-400">
                    {format(new Date(sub.submitted_at), "d MMM yyyy, HH:mm", { locale: id })}
                  </span>
                  {sub.score !== null && (
                    <span className="text-xs font-semibold text-success-600">Skor: {sub.score}/100</span>
                  )}
                </div>
                <p className="text-neutral-600 text-xs leading-relaxed">{truncate(sub.content, 200)}</p>
                {sub.ai_feedback && (
                  <div className="mt-2 pt-2 border-t border-neutral-100 flex gap-2">
                    <span className="text-sm flex-shrink-0">🤖</span>
                    <p className="text-xs text-brand-700 leading-relaxed">{sub.ai_feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mark complete */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 py-3 text-success-600 font-semibold text-sm">
            <CheckCircle size={20} />
            Modul ini sudah kamu selesaikan
          </div>
        ) : (
          <Button
            onClick={handleMarkComplete}
            disabled={!hasSubmission || completing}
            className={cn(
              "w-full h-12 text-base font-semibold",
              hasSubmission
                ? "bg-success-500 hover:bg-success-600 text-white"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            )}
          >
            {completing ? (
              <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
            ) : hasSubmission ? (
              "✓ Tandai Modul Selesai"
            ) : (
              "Submit task terlebih dahulu untuk menyelesaikan modul"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

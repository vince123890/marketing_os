import { Award, TrendingUp, TrendingDown, Target } from "lucide-react"

interface Props {
  avgScore: number | null
  gradedCount: number
  strongest: { title: string; score: number } | null
  weakest: { title: string; score: number } | null
}

function scoreColor(s: number) {
  if (s >= 80) return "text-success-600"
  if (s >= 60) return "text-warning-600"
  return "text-danger-500"
}

export default function ReportCard({ avgScore, gradedCount, strongest, weakest }: Props) {
  if (gradedCount === 0) return null

  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award size={16} className="text-brand-500" />
        <h2 className="text-sm font-semibold text-neutral-700">Rapor Belajar</h2>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 flex-shrink-0">
          <span className={`text-2xl font-bold ${avgScore !== null ? scoreColor(avgScore) : "text-neutral-400"}`}>
            {avgScore ?? "-"}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-700">Rata-rata Skor Task</p>
          <p className="text-xs text-neutral-400">dari {gradedCount} task yang dinilai AI</p>
        </div>
      </div>

      <div className="space-y-2">
        {strongest && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp size={14} className="text-success-500 flex-shrink-0" />
            <span className="text-neutral-500 flex-shrink-0">Terkuat:</span>
            <span className="text-neutral-700 font-medium truncate">{strongest.title}</span>
            <span className={`ml-auto font-semibold ${scoreColor(strongest.score)}`}>{strongest.score}</span>
          </div>
        )}
        {weakest && weakest.title !== strongest?.title && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown size={14} className="text-danger-400 flex-shrink-0" />
            <span className="text-neutral-500 flex-shrink-0">Perlu dilatih:</span>
            <span className="text-neutral-700 font-medium truncate">{weakest.title}</span>
            <span className={`ml-auto font-semibold ${scoreColor(weakest.score)}`}>{weakest.score}</span>
          </div>
        )}
        {!strongest && !weakest && (
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Target size={14} /> Kerjakan lebih banyak task untuk melihat analisis lengkap.
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Target, Clock, BookOpen, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const GOALS = [
  { value: "brand", label: "Membangun Brand Pribadi" },
  { value: "business", label: "Mengembangkan Bisnis / UKM" },
  { value: "career", label: "Karir di Bidang Marketing" },
  { value: "content", label: "Menjadi Content Creator" },
]

const TIMES = [
  { value: "15", label: "15 menit / hari" },
  { value: "30", label: "30 menit / hari" },
  { value: "60", label: "1 jam / hari" },
  { value: "120", label: "2+ jam / hari" },
]

interface Props {
  name: string
}

export default function WelcomeClient({ name }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState("")
  const [time, setTime] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleFinish() {
    setSaving(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, daily_time_minutes: parseInt(time) }),
      })
      if (!res.ok) throw new Error()
      router.push("/dashboard")
    } catch {
      toast.error("Gagal menyimpan. Coba lagi.")
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] animate-slide-up">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                s === step ? "w-8 bg-brand-500" : s < step ? "w-4 bg-brand-300" : "w-4 bg-neutral-200"
              )}
            />
          ))}
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <Target size={28} className="text-brand-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800">
                Halo, {name.split(" ")[0]}! 👋
              </h1>
              <p className="text-neutral-500 mt-2 text-sm">
                Apa tujuan utama kamu belajar marketing?
              </p>
            </div>

            <div className="space-y-2 text-left">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all",
                    goal === g.value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-brand-200"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!goal}
              className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold"
            >
              Lanjut <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {/* Step 2: Time */}
        {step === 2 && (
          <div className="text-center space-y-6">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-success-100 flex items-center justify-center mx-auto mb-4">
                <Clock size={28} className="text-success-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800">Berapa waktu belajarmu?</h1>
              <p className="text-neutral-500 mt-2 text-sm">
                Konsistensi lebih penting dari durasi panjang.
              </p>
            </div>

            <div className="space-y-2 text-left">
              {TIMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTime(t.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all",
                    time === t.value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-brand-200"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                Kembali
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!time}
                className="flex-[2] h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold"
              >
                Lanjut <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-warning-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-warning-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800">Siap memulai! 🚀</h1>
              <p className="text-neutral-500 mt-2 text-sm">
                MarketingOS telah dikustomisasi untuk kamu.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-brand-700">1</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Mulai dari Modul 1</p>
                  <p className="text-xs text-neutral-500">Fondasi Marketing — wajib diselesaikan pertama</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-success-700">✓</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Kerjakan task di setiap modul</p>
                  <p className="text-xs text-neutral-500">Praktek langsung = belajar lebih efektif</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">🔥</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Jaga streak harianmu</p>
                  <p className="text-xs text-neutral-500">Tulis daily log setiap hari untuk membangun habit</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">
                Kembali
              </Button>
              <Button
                onClick={handleFinish}
                disabled={saving}
                className="flex-[2] h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold"
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : "Mulai Belajar! 🎉"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

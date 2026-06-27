import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  BookOpen,
  Zap,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Brain,
  BarChart3,
  Flame,
  Star,
  ChevronRight,
  Play,
} from "lucide-react"

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-white text-neutral-800 overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-neutral-900 text-lg">MarketingOS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-500">
            <a href="#modules" className="hover:text-neutral-800 transition-colors">Modul</a>
            <a href="#features" className="hover:text-neutral-800 transition-colors">Fitur</a>
            <a href="#pricing" className="hover:text-neutral-800 transition-colors">Harga</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-20 pb-24 px-5 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-brand-50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -top-10 right-0 w-72 h-72 bg-brand-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 text-sm text-brand-700 font-medium mb-6">
            <Sparkles size={14} className="text-brand-500" />
            Platform Marketing Pertama dengan AI Coach Personal
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 leading-tight tracking-tight mb-6">
            Kuasai Marketing<br />
            <span className="text-brand-500">Dengan Praktek Nyata</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed mb-10">
            19 modul marketing terstruktur, task praktek yang dinilai AI, streak harian, dan rapor belajar personal.
            Bukan sekadar teori — kamu <strong className="text-neutral-700">langsung kerja</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-brand-200 hover:shadow-brand-300 hover:-translate-y-0.5 text-base"
            >
              Mulai Belajar Gratis
              <ArrowRight size={18} />
            </Link>
            <a
              href="#modules"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold px-8 py-4 rounded-xl border border-neutral-200 transition-all text-base"
            >
              <Play size={16} className="text-brand-500" />
              Lihat 19 Modul
            </a>
          </div>

          {/* Social proof mini */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-neutral-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-success-500" />
              Gratis 3 modul pertama
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-success-500" />
              Tanpa kartu kredit
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-success-500" />
              AI Coach dengan Gemini 2.5
            </div>
          </div>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="max-w-4xl mx-auto mt-16 relative">
          <div className="rounded-2xl border border-neutral-200 shadow-2xl shadow-neutral-200/60 overflow-hidden bg-neutral-50">
            {/* Browser bar */}
            <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
                <div className="w-3 h-3 rounded-full bg-neutral-300" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-md px-3 py-1.5 text-xs text-neutral-400 border border-neutral-200 max-w-xs mx-auto text-center">
                  marketing-os.vercel.app/dashboard
                </div>
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">V</div>
                  <div>
                    <p className="font-semibold text-neutral-800 text-sm">Halo, Vincent! 👋</p>
                    <p className="text-xs text-neutral-400">Lanjutkan belajar marketingmu hari ini.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                    <p className="text-xs text-neutral-500 mb-1">Progress Modul</p>
                    <p className="text-2xl font-bold text-neutral-800">12<span className="text-sm text-neutral-400 font-normal">/19</span></p>
                    <div className="mt-2 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: "63%" }} />
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <p className="text-xs text-neutral-500 mb-1">Streak Harian</p>
                    <p className="text-2xl font-bold text-neutral-800">🔥 7</p>
                    <p className="text-xs text-orange-500 mt-1 font-medium">Hari berturut-turut!</p>
                  </div>
                </div>
                <div className="border border-neutral-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Rapor Belajar</p>
                    <span className="text-xs text-brand-600 font-semibold">AI Graded</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-success-50 flex items-center justify-center">
                      <span className="text-xl font-bold text-success-600">84</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">Rata-rata Skor Task</p>
                      <p className="text-xs text-neutral-400">dari 12 task yang dinilai AI</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { n: "01", title: "Fondasi Marketing", done: true },
                  { n: "02", title: "Market Research", done: true },
                  { n: "03", title: "Brand Strategy", done: true },
                  { n: "04", title: "Content Marketing", done: false, active: true },
                  { n: "05", title: "SEO & SEM", done: false },
                ].map((m) => (
                  <div
                    key={m.n}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs border ${
                      m.active
                        ? "bg-brand-50 border-brand-200"
                        : m.done
                        ? "bg-neutral-50 border-neutral-100"
                        : "bg-white border-neutral-100"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                        m.done
                          ? "bg-success-100 text-success-600"
                          : m.active
                          ? "bg-brand-100 text-brand-600"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {m.done ? "✓" : m.n}
                    </div>
                    <span className={m.done ? "text-neutral-400 line-through" : m.active ? "text-brand-700 font-semibold" : "text-neutral-600"}>
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <section className="border-y border-neutral-100 bg-neutral-50 py-8">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "19", label: "Modul Terstruktur" },
              { value: "AI", label: "Coach Personal (Gemini)" },
              { value: "100%", label: "Learn by Doing" },
              { value: "0", label: "Teori Tanpa Praktek" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-extrabold text-neutral-900">{s.value}</p>
                <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM → SOLUTION ─────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-danger-500 mb-3">Masalah yang sering terjadi</p>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6 leading-snug">
                Banyak belajar, tapi tidak bisa dipraktekan
              </h2>
              <div className="space-y-4">
                {[
                  "Nonton puluhan jam video, lupa semua setelah seminggu",
                  "Kursus selesai tapi tidak tahu mau mulai dari mana",
                  "Tidak ada feedback — tidak tahu salah di mana",
                  "Belajar sendiri susah konsisten tanpa struktur",
                ].map((p) => (
                  <div key={p} className="flex items-start gap-3 text-sm text-neutral-500">
                    <span className="text-danger-400 mt-0.5 flex-shrink-0">✕</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
            {/* Solution */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-success-600 mb-3">Solusi MarketingOS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6 leading-snug">
                Belajar sambil langsung kerja
              </h2>
              <div className="space-y-4">
                {[
                  "Setiap modul ada task yang harus dikerjakan — bukan soal pilihan ganda",
                  "AI Coach memberi feedback personal atas jawaban taskmu",
                  "Streak harian menjaga konsistensi belajarmu",
                  "Rapor belajar menunjukkan area yang perlu ditingkatkan",
                ].map((p) => (
                  <div key={p} className="flex items-start gap-3 text-sm text-neutral-600">
                    <CheckCircle2 size={16} className="text-success-500 mt-0.5 flex-shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="py-20 px-5 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Fitur Unggulan</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">
              Semua yang kamu butuhkan untuk mahir marketing
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                color: "bg-brand-50 text-brand-500",
                title: "Task Praktek Nyata",
                desc: "Setiap modul punya task yang mensimulasikan pekerjaan marketing sesungguhnya — bukan teori.",
              },
              {
                icon: Brain,
                color: "bg-purple-50 text-purple-500",
                title: "AI Coach Personal",
                desc: "Gemini 2.5 Flash menilai taskmu, memberi skor, dan saran perbaikan yang spesifik ke jawabanmu.",
              },
              {
                icon: Flame,
                color: "bg-orange-50 text-orange-500",
                title: "Streak & Daily Log",
                desc: "Bangun kebiasaan belajar harian. Streak tracker memotivasi kamu untuk terus konsisten.",
              },
              {
                icon: BarChart3,
                color: "bg-success-50 text-success-600",
                title: "Rapor Belajar",
                desc: "Lihat rata-rata skor, modul terkuat, dan area yang perlu kamu tingkatkan secara visual.",
              },
              {
                icon: Zap,
                color: "bg-yellow-50 text-yellow-600",
                title: "Revisi Interaktif",
                desc: "Kurang puas? Minta AI Coach bantu perbaiki jawabanmu — belajar dari feedback langsung.",
              },
              {
                icon: Award,
                color: "bg-brand-50 text-brand-600",
                title: "Sertifikat Penyelesaian",
                desc: "Selesaikan 19 modul dan dapatkan sertifikat digital yang bisa kamu print atau simpan sebagai PDF.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md hover:border-neutral-300 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-neutral-800 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 19 MODULES ─────────────────────────────────────── */}
      <section id="modules" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Kurikulum</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-3">
              19 Modul Sistem Marketing
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              Dirancang dari nol sampai mahir — setiap modul membangun fondasi untuk modul berikutnya.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-8">
            {[
              { n: 1, title: "Fondasi Marketing Modern" },
              { n: 2, title: "Market Research & Analisis" },
              { n: 3, title: "Brand Strategy & Positioning" },
              { n: 4, title: "Content Marketing" },
              { n: 5, title: "SEO & SEM" },
              { n: 6, title: "Social Media Marketing" },
              { n: 7, title: "Email Marketing" },
              { n: 8, title: "Paid Advertising (Meta & Google)" },
              { n: 9, title: "Copywriting yang Mengkonversi" },
              { n: 10, title: "Marketing Funnel & Conversion" },
              { n: 11, title: "Data Analytics & Reporting" },
              { n: 12, title: "Growth Hacking" },
              { n: 13, title: "Customer Journey Mapping" },
              { n: 14, title: "Product Marketing" },
              { n: 15, title: "Influencer & Partnership Marketing" },
              { n: 16, title: "Video & Visual Marketing" },
              { n: 17, title: "Marketing Automation" },
              { n: 18, title: "Strategi Go-to-Market" },
              { n: 19, title: "Marketing Leadership & Roadmap" },
            ].map(({ n, title }) => (
              <div
                key={n}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  n <= 3
                    ? "border-brand-200 bg-brand-50"
                    : "border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50"
                } transition-colors`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    n <= 3 ? "bg-brand-500 text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {String(n).padStart(2, "0")}
                </div>
                <span className={`text-sm font-medium ${n <= 3 ? "text-brand-800" : "text-neutral-700"}`}>
                  {title}
                </span>
                {n <= 3 && (
                  <span className="ml-auto text-xs font-semibold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
                    Gratis
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold text-sm"
            >
              Mulai dari modul pertama — gratis
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-20 px-5 bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Cara Kerja</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Dari nol ke mahir dalam 4 langkah
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: BookOpen, title: "Baca Materi", desc: "Materi ringkas dan terstruktur — bukan ceramah panjang." },
              { step: "02", icon: Target, title: "Kerjakan Task", desc: "Praktek langsung dengan task realistik per modul." },
              { step: "03", icon: Sparkles, title: "Terima Feedback AI", desc: "AI Coach nilai jawaban kamu dan beri saran konkret." },
              { step: "04", icon: TrendingUp, title: "Pantau Progress", desc: "Rapor belajar dan streak menjaga kamu tetap on track." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-brand-400" />
                </div>
                <p className="text-xs font-bold text-brand-400 mb-1">{step}</p>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL-STYLE ──────────────────────────────── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Kenapa Ini Berbeda</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">
              Bukan kursus biasa
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Setiap task saya kerjakan seperti proyek sungguhan. AI langsung kasih tahu mana yang kurang dan kenapa.",
                name: "Pelajar Content Marketing",
                score: "Skor rata-rata: 87/100",
              },
              {
                quote: "Streak 14 hari membuat saya tidak berani skip. Akhirnya konsisten belajar marketing untuk pertama kalinya.",
                name: "Pemilik UMKM Online",
                score: "14 hari streak",
              },
              {
                quote: "Sertifikatnya detail — ada skor rata-rata dan tanggal. Langsung saya taruh di LinkedIn profil.",
                name: "Fresh Graduate Marketing",
                score: "Selesai 19 modul",
              },
            ].map(({ quote, name, score }) => (
              <div key={name} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed mb-5 italic">
                  &quot;{quote}&quot;
                </p>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{name}</p>
                  <p className="text-xs text-brand-600 font-medium mt-0.5">{score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-5 bg-neutral-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Harga</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900">
              Mulai gratis, upgrade kapan saja
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-7">
              <p className="text-sm font-semibold text-neutral-500 mb-1">Gratis</p>
              <p className="text-4xl font-extrabold text-neutral-900 mb-1">Rp 0</p>
              <p className="text-sm text-neutral-400 mb-6">Selamanya</p>
              <ul className="space-y-3 mb-8">
                {[
                  "3 modul pertama (Fondasi, Research, Brand)",
                  "Task & AI feedback (perlu Gemini API key sendiri)",
                  "Streak & Daily Log",
                  "Rapor Belajar",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                    <CheckCircle2 size={15} className="text-success-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center w-full border border-neutral-300 hover:border-neutral-400 text-neutral-700 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                Daftar Gratis
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-brand-500 text-white rounded-2xl p-7 relative overflow-hidden shadow-lg shadow-brand-200">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-brand-400/30 rounded-full" />
              <div className="absolute -bottom-8 -right-4 w-40 h-40 bg-brand-600/30 rounded-full" />
              <p className="text-sm font-semibold text-brand-100 mb-1 relative">Pro</p>
              <p className="text-4xl font-extrabold text-white mb-1 relative">
                Rp 99.000
              </p>
              <p className="text-sm text-brand-200 mb-6 relative">/ bulan</p>
              <ul className="space-y-3 mb-8 relative">
                {[
                  "Semua 19 modul tanpa batas",
                  "AI Coach feedback + revisi interaktif",
                  "Ringkasan modul otomatis",
                  "Rekomendasi belajar personal",
                  "Sertifikat penyelesaian",
                  "Prioritas akses fitur baru",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-brand-50">
                    <CheckCircle2 size={15} className="text-brand-200 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center w-full bg-white hover:bg-brand-50 text-brand-600 font-bold py-3 rounded-xl transition-colors text-sm relative"
              >
                Mulai dengan Pro
              </Link>
            </div>
          </div>
          <p className="text-center text-xs text-neutral-400 mt-5">
            Pembayaran manual via transfer bank • Aktivasi manual dalam 1x24 jam
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="py-24 px-5 bg-brand-500 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-700 pointer-events-none" />
        <div className="absolute -top-20 -left-10 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Mulai perjalanan marketingmu hari ini
          </h2>
          <p className="text-brand-100 mb-8 text-lg">
            3 modul pertama gratis. Tidak perlu kartu kredit.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white hover:bg-brand-50 text-brand-600 font-bold px-10 py-4 rounded-xl transition-all text-base shadow-lg"
          >
            Daftar Sekarang — Gratis
            <ArrowRight size={18} />
          </Link>
          <p className="text-brand-200 text-sm mt-5">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-white underline underline-offset-2 hover:no-underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-neutral-900 text-neutral-400 py-10 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="font-semibold text-neutral-300">MarketingOS</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/login" className="hover:text-neutral-200 transition-colors">Masuk</Link>
              <Link href="/register" className="hover:text-neutral-200 transition-colors">Daftar</Link>
              <a href="#modules" className="hover:text-neutral-200 transition-colors">Modul</a>
              <a href="#pricing" className="hover:text-neutral-200 transition-colors">Harga</a>
            </div>
            <p className="text-xs text-neutral-600">
              © 2026 MarketingOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

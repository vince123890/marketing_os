"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  name: string
  avgScore: number | null
  userId: string
}

export default function CertificateClient({ name, avgScore, userId }: Props) {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const certId = `MOS-CERT-${userId.replace(/-/g, "").slice(0, 8).toUpperCase()}`

  return (
    <div className="max-w-[860px] animate-fade-in">
      {/* Toolbar — hidden on print */}
      <div className="flex items-center justify-between mb-5 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Sertifikat Penyelesaian 🎓</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Selamat! Kamu telah menyelesaikan seluruh 19 modul MarketingOS.
          </p>
        </div>
        <Button
          onClick={() => window.print()}
          className="bg-brand-500 hover:bg-brand-600 text-white h-10"
        >
          <Printer size={16} /> Cetak / Simpan PDF
        </Button>
      </div>

      {/* Certificate */}
      <div className="certificate bg-white border-2 border-brand-200 rounded-2xl p-10 md:p-14 text-center relative overflow-hidden shadow-sm">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-brand-400 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-brand-400 rounded-br-2xl" />

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="font-bold text-neutral-800">MarketingOS</span>
        </div>

        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mt-6">Sertifikat Penyelesaian</p>

        <p className="text-sm text-neutral-500 mt-6">Diberikan kepada</p>
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mt-2 mb-2">{name}</h2>

        <div className="w-24 h-px bg-brand-300 mx-auto my-4" />

        <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
          atas keberhasilannya menyelesaikan seluruh <strong>19 modul</strong> program
          pembelajaran marketing <strong>&quot;Learn by Doing&quot;</strong> dengan menyelesaikan
          setiap task praktek.
        </p>

        {avgScore !== null && (
          <div className="inline-flex items-center gap-2 mt-6 bg-brand-50 px-4 py-2 rounded-full">
            <span className="text-xs text-neutral-500">Rata-rata skor task:</span>
            <span className="text-lg font-bold text-brand-600">{avgScore}/100</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-10 text-xs text-neutral-400 max-w-md mx-auto">
          <div className="text-left">
            <p className="font-mono">{certId}</p>
            <p>ID Sertifikat</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-neutral-600">{today}</p>
            <p>Tanggal terbit</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .certificate, .certificate * { visibility: visible; }
          .certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          @page { size: landscape; margin: 1cm; }
        }
      `}</style>
    </div>
  )
}

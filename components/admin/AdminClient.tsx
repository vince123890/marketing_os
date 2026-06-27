"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle, ExternalLink, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface PendingOrder {
  proof_id: string
  order_id: string
  uploaded_at: string
  proof_url: string | null
  plan: string
  amount: number
  buyer_name: string
  buyer_email: string
}

export default function AdminClient() {
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/subscription/pending")
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setOrders(data.orders)
    } catch {
      toast.error("Gagal memuat daftar order")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function verify(proofId: string, action: "approve" | "reject") {
    let rejection_reason: string | undefined
    if (action === "reject") {
      const reason = window.prompt("Alasan penolakan (opsional):") ?? ""
      rejection_reason = reason.trim() || "Bukti transfer tidak valid"
    }

    setProcessing(proofId)
    try {
      const res = await fetch("/api/admin/subscription/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof_id: proofId, action, rejection_reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success(action === "approve" ? "Langganan diaktifkan! 🎉" : "Bukti ditolak")
      setOrders((prev) => prev.filter((o) => o.proof_id !== proofId))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memproses")
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-400">
        <Inbox size={36} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">Tidak ada pembayaran yang menunggu verifikasi</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.proof_id} className="card-base p-5">
          <div className="flex flex-col md:flex-row gap-5">
            {/* Proof image */}
            <div className="md:w-48 flex-shrink-0">
              {o.proof_url ? (
                <a href={o.proof_url} target="_blank" rel="noopener noreferrer" className="block group">
                  <img
                    src={o.proof_url}
                    alt="Bukti transfer"
                    className="w-full h-40 object-cover rounded-lg border border-neutral-200 group-hover:opacity-90 transition-opacity"
                  />
                  <span className="flex items-center gap-1 text-xs text-brand-600 mt-1.5 justify-center">
                    <ExternalLink size={11} /> Lihat ukuran penuh
                  </span>
                </a>
              ) : (
                <div className="w-full h-40 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center text-xs text-neutral-400">
                  Gambar tidak tersedia
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-neutral-800">{o.buyer_name}</p>
                  <p className="text-xs text-neutral-500">{o.buyer_email}</p>
                </div>
                <span className="text-xs bg-warning-100 text-warning-700 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
                  Menunggu
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
                <span className="text-neutral-400">Plan</span>
                <span className="font-medium text-neutral-700">
                  {o.plan === "lifetime" ? "Lifetime Access" : "PRO Bulanan"}
                </span>
                <span className="text-neutral-400">Nominal</span>
                <span className="font-bold text-neutral-800">Rp {o.amount.toLocaleString("id-ID")}</span>
                <span className="text-neutral-400">Order ID</span>
                <span className="font-mono text-xs text-neutral-600 truncate">{o.order_id}</span>
                <span className="text-neutral-400">Diunggah</span>
                <span className="text-neutral-600 text-xs">
                  {format(new Date(o.uploaded_at), "d MMM yyyy, HH:mm", { locale: id })}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => verify(o.proof_id, "approve")}
                  disabled={processing === o.proof_id}
                  className="flex-1 h-10 bg-success-500 hover:bg-success-600 text-white text-sm font-semibold"
                >
                  {processing === o.proof_id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <><CheckCircle size={14} /> Setujui</>
                  )}
                </Button>
                <Button
                  onClick={() => verify(o.proof_id, "reject")}
                  disabled={processing === o.proof_id}
                  variant="outline"
                  className="flex-1 h-10 border-danger-200 text-danger-600 hover:bg-danger-50 text-sm font-semibold"
                >
                  <XCircle size={14} /> Tolak
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

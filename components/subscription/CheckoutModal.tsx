"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, X, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Plan {
  id: string
  name: string
  price: number
}

interface Props {
  plan: Plan
  onClose: () => void
  onSuccess: () => void
}

export default function CheckoutModal({ plan, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<{
    id: string
    bank_name: string
    bank_account: string
    amount: number
    expires_at: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setOrder(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal membuat order"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  function copyAccount() {
    if (!order) return
    navigator.clipboard.writeText(order.bank_account)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-[420px] p-6 animate-scale-in shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-neutral-800 text-lg">Checkout</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {!order ? (
          <>
            <div className="bg-neutral-50 rounded-xl p-4 mb-5">
              <p className="text-sm text-neutral-500">Plan yang dipilih</p>
              <p className="font-bold text-neutral-800 mt-0.5">{plan.name}</p>
              <p className="text-xl font-bold text-brand-600 mt-1">
                Rp {plan.price.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="text-sm text-neutral-600 bg-brand-50 rounded-xl p-4 mb-5 space-y-1.5">
              <p className="font-semibold text-brand-700">Cara pembayaran:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-brand-700">
                <li>Klik tombol di bawah untuk mendapatkan nomor rekening</li>
                <li>Transfer sesuai nominal yang tertera</li>
                <li>Upload bukti transfer</li>
                <li>Admin akan verifikasi dalam 1×24 jam</li>
              </ol>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Membuat Order...</> : "Buat Order Pembayaran"}
            </Button>
          </>
        ) : (
          <>
            <div className="bg-success-50 border border-success-200 rounded-xl p-4 mb-5">
              <p className="text-xs text-success-600 font-semibold uppercase tracking-wide mb-1">Transfer ke:</p>
              <p className="font-bold text-neutral-800 text-sm">Bank {order.bank_name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xl font-bold text-neutral-800 font-mono tracking-widest">
                  {order.bank_account}
                </p>
                <button
                  onClick={copyAccount}
                  className="text-brand-500 hover:text-brand-600 transition-colors"
                  aria-label="Copy nomor rekening"
                >
                  {copied ? <CheckCircle size={18} className="text-success-500" /> : <Copy size={18} />}
                </button>
              </div>
              <div className="mt-2 pt-2 border-t border-success-200">
                <p className="text-sm text-neutral-600">
                  Nominal: <strong className="text-neutral-800">Rp {order.amount.toLocaleString("id-ID")}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-500 mb-4 text-center">
              Batas pembayaran: <strong className="text-neutral-700">
                {new Date(order.expires_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB
              </strong>
            </p>

            <Button
              onClick={onSuccess}
              className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold"
            >
              Oke, Saya Akan Transfer
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

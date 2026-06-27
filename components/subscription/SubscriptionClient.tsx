"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, CheckCircle, Clock, XCircle, Upload, Star, Crown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import CheckoutModal from "./CheckoutModal"
import UploadProofModal from "./UploadProofModal"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface ActiveOrder {
  id: string
  plan: string
  amount: number
  status: string
  bank_name: string
  bank_account: string
  expires_at: string
  created_at: string
}

interface LatestProof {
  id: string
  status: string
  rejection_reason: string | null
  uploaded_at: string
}

interface Props {
  currentPlan: string
  activeOrder: ActiveOrder | null
  latestProof: LatestProof | null
}

const PLANS = [
  {
    id: "pro_monthly",
    name: "PRO Bulanan",
    price: 99000,
    period: "/bulan",
    icon: Star,
    color: "brand",
    features: [
      "Akses 19 modul lengkap",
      "Task submission & feedback AI",
      "Daily log streak tracking",
      "Progress analytics",
      "Akses modul baru (update)",
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime Access",
    price: 499000,
    period: "sekali bayar",
    icon: Crown,
    color: "warning",
    features: [
      "Semua fitur PRO",
      "Akses seumur hidup",
      "Update materi gratis selamanya",
      "Priority support",
      "Early access fitur baru",
    ],
    highlight: true,
  },
]

export default function SubscriptionClient({ currentPlan, activeOrder, latestProof }: Props) {
  const [checkoutPlan, setCheckoutPlan] = useState<typeof PLANS[0] | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const isPro = ["pro", "trial", "lifetime"].includes(currentPlan)

  const planLabel: Record<string, string> = {
    free: "Free",
    trial: "Trial",
    pro: "PRO",
    lifetime: "Lifetime",
  }

  const orderStatusUI = () => {
    if (!activeOrder) return null

    if (activeOrder.status === "pending_payment") {
      const expiresAt = new Date(activeOrder.expires_at)
      const now = new Date()
      const isExpired = expiresAt < now

      if (isExpired) return null

      return (
        <div className="card-base border border-warning-200 bg-warning-50 p-5 mb-6">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-warning-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-warning-800">Menunggu Pembayaran</p>
              <p className="text-sm text-warning-700 mt-1">
                Transfer ke rekening berikut sebelum{" "}
                <strong>{format(expiresAt, "d MMMM yyyy, HH:mm", { locale: id })} WIB</strong>
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-warning-200 space-y-1 text-sm">
                <p className="font-medium text-neutral-700">Bank {activeOrder.bank_name}</p>
                <p className="text-lg font-bold text-neutral-800 font-mono tracking-widest">
                  {activeOrder.bank_account}
                </p>
                <p className="text-neutral-500">
                  Nominal: <strong className="text-neutral-800">
                    Rp {activeOrder.amount.toLocaleString("id-ID")}
                  </strong>
                </p>
              </div>
              <Button
                onClick={() => setShowUpload(true)}
                className="mt-3 h-9 text-sm bg-brand-500 hover:bg-brand-600 text-white"
              >
                <Upload size={14} /> Upload Bukti Transfer
              </Button>
            </div>
          </div>
        </div>
      )
    }

    if (activeOrder.status === "waiting_verification") {
      return (
        <div className="card-base border border-brand-200 bg-brand-50 p-5 mb-6">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-brand-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-800">Menunggu Verifikasi Admin</p>
              <p className="text-sm text-brand-700 mt-1">
                Bukti transfer kamu sedang direview. Aktivasi biasanya 1×24 jam.
              </p>
              <p className="text-xs text-brand-500 mt-1">
                Diunggah: {latestProof ? format(new Date(latestProof.uploaded_at), "d MMM yyyy, HH:mm", { locale: id }) : "-"}
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (activeOrder.status === "proof_rejected") {
      return (
        <div className="card-base border border-danger-200 bg-danger-50 p-5 mb-6">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="text-danger-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-danger-800">Bukti Transfer Ditolak</p>
              {latestProof?.rejection_reason && (
                <p className="text-sm text-danger-700 mt-1">
                  Alasan: {latestProof.rejection_reason}
                </p>
              )}
              <Button
                onClick={() => setShowUpload(true)}
                className="mt-3 h-9 text-sm bg-danger-500 hover:bg-danger-600 text-white"
              >
                <Upload size={14} /> Upload Ulang Bukti Transfer
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="max-w-[720px] animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Langganan</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-neutral-500">Plan aktif:</span>
          <span className={cn(
            "text-xs font-bold px-2.5 py-0.5 rounded-full",
            isPro ? "bg-brand-100 text-brand-700" : "bg-neutral-100 text-neutral-600"
          )}>
            {planLabel[currentPlan] ?? currentPlan}
          </span>
        </div>
      </div>

      {/* Active order status */}
      {orderStatusUI()}

      {/* Current plan status */}
      {isPro && !activeOrder && (
        <div className="card-base border border-success-200 bg-success-50 p-4 mb-6 flex items-center gap-3">
          <CheckCircle size={20} className="text-success-600" />
          <div>
            <p className="font-semibold text-success-800">Plan {planLabel[currentPlan]} Aktif</p>
            <p className="text-sm text-success-700">Kamu memiliki akses penuh ke semua 19 modul.</p>
          </div>
        </div>
      )}

      {/* Plan cards */}
      {!isPro && !activeOrder && (
        <>
          <p className="text-sm text-neutral-600 mb-4">
            Upgrade ke PRO untuk akses penuh semua 19 modul dan fitur premium.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "card-base p-5 flex flex-col relative",
                    plan.highlight ? "border-warning-300 ring-1 ring-warning-200" : "border-neutral-200"
                  )}
                >
                  {plan.highlight && (
                    <div className="absolute -top-2.5 left-4">
                      <span className="text-xs font-bold bg-warning-500 text-white px-2.5 py-0.5 rounded-full">
                        TERPOPULER
                      </span>
                    </div>
                  )}

                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    plan.color === "brand" ? "bg-brand-100" : "bg-warning-100"
                  )}>
                    <Icon size={20} className={plan.color === "brand" ? "text-brand-600" : "text-warning-600"} />
                  </div>

                  <h3 className="font-bold text-neutral-800">{plan.name}</h3>
                  <div className="mt-1 mb-3">
                    <span className="text-2xl font-bold text-neutral-800">
                      Rp {plan.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-sm text-neutral-500 ml-1">{plan.period}</span>
                  </div>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-neutral-600">
                        <CheckCircle size={12} className="text-success-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => setCheckoutPlan(plan)}
                    className={cn(
                      "w-full h-10 text-sm font-semibold",
                      plan.highlight
                        ? "bg-warning-500 hover:bg-warning-600 text-white"
                        : "bg-brand-500 hover:bg-brand-600 text-white"
                    )}
                  >
                    <Zap size={14} /> Pilih {plan.name}
                  </Button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Modals */}
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={() => {
            setCheckoutPlan(null)
            window.location.reload()
          }}
        />
      )}

      {showUpload && activeOrder && (
        <UploadProofModal
          orderId={activeOrder.id}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

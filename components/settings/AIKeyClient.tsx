"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff, Sparkles, Trash2, CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AIKeyClient() {
  const [key, setKey] = useState("")
  const [hasKey, setHasKey] = useState(false)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    fetch("/api/ai/key")
      .then((r) => r.json())
      .then((d) => setHasKey(!!d.has_key))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!key.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/ai/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: key.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setHasKey(true)
      setKey("")
      toast.success("API key tervalidasi & tersimpan ke akunmu ✅")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan key")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    try {
      const res = await fetch("/api/ai/key", { method: "DELETE" })
      if (!res.ok) throw new Error()
      setHasKey(false)
      setKey("")
      toast.success("API key dihapus dari akunmu")
    } catch {
      toast.error("Gagal menghapus key")
    } finally {
      setRemoving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-neutral-400">
        <Loader2 size={22} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Info card */}
      <div className="card-base p-4 bg-brand-50 border border-brand-100">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-brand-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-brand-800 space-y-1">
            <p className="font-semibold">Bring Your Own Key (BYOK)</p>
            <p className="text-xs text-brand-700 leading-relaxed">
              Setiap pengguna memakai API key Gemini miliknya sendiri. Key kamu disimpan{" "}
              <strong>terenkripsi di akunmu</strong> dan ikut ke perangkat mana pun saat kamu login.
              Model yang dipakai: <strong>Gemini 2.5 Flash</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Current status */}
      {hasKey && (
        <div className="card-base p-4 border border-success-200 bg-success-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle size={18} className="text-success-600" />
            <div>
              <p className="text-sm font-semibold text-success-800">AI Coach aktif</p>
              <p className="text-xs text-success-700">Key Gemini sudah tersimpan di akunmu.</p>
            </div>
          </div>
          <Button
            onClick={handleRemove}
            disabled={removing}
            variant="outline"
            className="h-9 text-sm border-danger-200 text-danger-600 hover:bg-danger-50"
          >
            {removing ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /> Hapus</>}
          </Button>
        </div>
      )}

      {/* Key input */}
      <div className="card-base p-5 space-y-3">
        <label className="text-sm font-semibold text-neutral-700">
          {hasKey ? "Ganti API Key" : "Masukkan API Key Gemini"}
        </label>

        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder="AIza..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="pr-10 font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label={show ? "Sembunyikan" : "Tampilkan"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <Button
          onClick={handleSave}
          disabled={!key.trim() || saving}
          className="bg-brand-500 hover:bg-brand-600 text-white h-9 text-sm"
        >
          {saving ? (
            <><Loader2 size={14} className="animate-spin" /> Memvalidasi & menyimpan...</>
          ) : (
            "Validasi & Simpan Key"
          )}
        </Button>
        <p className="text-xs text-neutral-400">
          Key akan diuji ke Gemini dulu sebelum disimpan, supaya kamu tahu langsung kalau salah.
        </p>
      </div>

      {/* How to get key */}
      <div className="text-sm text-neutral-500 space-y-2">
        <p className="font-medium text-neutral-700">Cara mendapatkan API key (gratis):</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>
            Buka{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline inline-flex items-center gap-0.5"
            >
              Google AI Studio <ExternalLink size={10} />
            </a>
          </li>
          <li>Login dengan akun Google</li>
          <li>Klik &quot;Create API key&quot; → copy</li>
          <li>Paste di kolom atas, klik &quot;Validasi &amp; Simpan Key&quot;</li>
        </ol>
      </div>
    </div>
  )
}

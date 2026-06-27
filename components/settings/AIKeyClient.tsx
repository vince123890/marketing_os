"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff, Sparkles, Trash2, CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const STORAGE_KEY = "gemini_api_key"

export default function AIKeyClient() {
  const [key, setKey] = useState("")
  const [saved, setSaved] = useState(false)
  const [show, setShow] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setKey(stored)
      setSaved(true)
    }
  }, [])

  function handleSave() {
    if (!key.trim()) return
    localStorage.setItem(STORAGE_KEY, key.trim())
    setSaved(true)
    toast.success("API key tersimpan di browser ini")
  }

  function handleRemove() {
    localStorage.removeItem(STORAGE_KEY)
    setKey("")
    setSaved(false)
    toast.success("API key dihapus")
  }

  async function handleTest() {
    if (!key.trim()) return
    setTesting(true)
    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: key.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success("API key valid & berfungsi! ✅")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Key tidak valid")
    } finally {
      setTesting(false)
    }
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
              Key kamu disimpan <strong>hanya di browser ini</strong> (localStorage) dan dikirim ke
              server hanya saat menilai jawaban — tidak pernah disimpan di database kami. Model yang
              dipakai: <strong>Gemini 2.5 Flash</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Key input */}
      <div className="card-base p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-700">API Key Gemini</label>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-success-600 font-medium">
              <CheckCircle size={12} /> Tersimpan
            </span>
          )}
        </div>

        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder="AIza..."
            value={key}
            onChange={(e) => {
              setKey(e.target.value)
              setSaved(false)
            }}
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

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!key.trim()}
            className="bg-brand-500 hover:bg-brand-600 text-white h-9 text-sm"
          >
            Simpan Key
          </Button>
          <Button
            onClick={handleTest}
            disabled={!key.trim() || testing}
            variant="outline"
            className="h-9 text-sm"
          >
            {testing ? <><Loader2 size={14} className="animate-spin" /> Menguji...</> : "Test Key"}
          </Button>
          {saved && (
            <Button
              onClick={handleRemove}
              variant="outline"
              className="h-9 text-sm border-danger-200 text-danger-600 hover:bg-danger-50 ml-auto"
            >
              <Trash2 size={14} /> Hapus
            </Button>
          )}
        </div>
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
          <li>Paste di kolom atas, klik &quot;Simpan Key&quot;</li>
        </ol>
      </div>
    </div>
  )
}

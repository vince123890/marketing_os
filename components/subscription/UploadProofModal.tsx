"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Loader2, X, Upload, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

interface Props {
  orderId: string
  onClose: () => void
  onSuccess: () => void
}

export default function UploadProofModal({ orderId, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Format harus JPG, PNG, atau WebP")
      return
    }
    if (f.size > MAX_SIZE) {
      toast.error("Ukuran file maksimal 5MB")
      return
    }

    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("order_id", orderId)

      const res = await fetch("/api/subscription/upload-proof", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success("Bukti transfer berhasil diunggah!")
      onSuccess()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengunggah"
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-[420px] p-6 animate-scale-in shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-neutral-800 text-lg">Upload Bukti Transfer</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4",
            preview ? "border-brand-300 bg-brand-50" : "border-neutral-200 hover:border-brand-200 hover:bg-neutral-50"
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview bukti transfer"
              className="max-h-48 mx-auto rounded-lg object-contain"
            />
          ) : (
            <div className="space-y-2">
              <ImageIcon size={32} className="mx-auto text-neutral-300" />
              <p className="text-sm font-medium text-neutral-600">Klik untuk pilih file</p>
              <p className="text-xs text-neutral-400">JPG, PNG, WebP · Maks. 5MB</p>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {file && (
          <p className="text-xs text-neutral-500 mb-4 text-center">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11" disabled={uploading}>
            Batal
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-[2] h-11 bg-brand-500 hover:bg-brand-600 text-white font-semibold"
          >
            {uploading ? (
              <><Loader2 size={14} className="animate-spin" /> Mengunggah...</>
            ) : (
              <><Upload size={14} /> Upload Bukti</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

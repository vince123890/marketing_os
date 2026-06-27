// Gemini 2.5 Flash integration (BYOK — user provides their own API key).
// The key is passed per-request and never stored server-side.

const GEMINI_MODEL = "gemini-2.5-flash"
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export interface AIFeedback {
  score: number
  feedback: string
}

// Low-level call: send a prompt, get plain text back. Shared by all AI features.
export async function callGemini(
  apiKey: string,
  prompt: string,
  opts: { json?: boolean; temperature?: number } = {}
): Promise<string> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.5,
        ...(opts.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    if (res.status === 400 || res.status === 403) {
      throw new Error("API key Gemini tidak valid atau tidak punya akses.")
    }
    if (res.status === 429) {
      throw new Error("Kuota Gemini habis. Coba lagi nanti.")
    }
    throw new Error(`Gemini error (${res.status}): ${errBody.slice(0, 200)}`)
  }

  const data = await res.json()
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Gemini tidak mengembalikan respons.")
  return text
}

interface FeedbackInput {
  apiKey: string
  taskTitle: string
  taskDescription: string
  rubric: string
  answer: string
}

/**
 * Ask Gemini to grade a task answer against its rubric.
 * Returns { score 0-100, feedback }. Throws on API / parse error.
 */
export async function generateTaskFeedback(input: FeedbackInput): Promise<AIFeedback> {
  const { apiKey, taskTitle, taskDescription, rubric, answer } = input

  const prompt = `Kamu adalah AI Coach marketing yang menilai jawaban latihan murid dengan suportif tapi jujur. Gunakan Bahasa Indonesia.

TASK: ${taskTitle}
INSTRUKSI TASK: ${taskDescription}
RUBRIK PENILAIAN: ${rubric}

JAWABAN MURID:
"""
${answer}
"""

Nilai jawaban berdasarkan rubrik. Berikan:
1. Skor 0-100 (integer)
2. Feedback singkat (2-4 kalimat): apa yang sudah bagus, dan 1-2 saran konkret untuk perbaikan.

Balas HANYA dalam format JSON valid tanpa markdown, tanpa teks lain:
{"score": <angka>, "feedback": "<feedback>"}`

  const text = await callGemini(apiKey, prompt, { json: true, temperature: 0.4 })

  let parsed: { score?: unknown; feedback?: unknown }
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("Gagal membaca respons AI.")
  }

  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)))
  const feedback = typeof parsed.feedback === "string" ? parsed.feedback.trim() : ""

  if (!feedback) throw new Error("Respons AI tidak lengkap.")

  return { score, feedback }
}

/**
 * Coaching suggestions to improve an answer (no score) — closes the learning loop.
 */
export async function suggestRevision(input: {
  apiKey: string
  taskTitle: string
  taskDescription: string
  rubric: string
  answer: string
}): Promise<string> {
  const { apiKey, taskTitle, taskDescription, rubric, answer } = input
  const prompt = `Kamu adalah AI Coach marketing. Bantu murid MEMPERBAIKI jawaban mereka. Gunakan Bahasa Indonesia, nada suportif dan konkret.

TASK: ${taskTitle}
INSTRUKSI: ${taskDescription}
RUBRIK: ${rubric}

JAWABAN MURID SAAT INI:
"""
${answer}
"""

Berikan panduan revisi yang actionable:
- Sebutkan 2-3 hal spesifik yang perlu ditambah/diperbaiki agar jawaban lebih kuat sesuai rubrik
- Beri 1 contoh konkret bagaimana memperbaikinya
- JANGAN tuliskan ulang jawaban lengkapnya untuk murid — bimbing, jangan kerjakan untuk mereka

Balas dalam teks biasa (boleh pakai poin dengan tanda "-"), maksimal 6 kalimat.`

  return (await callGemini(apiKey, prompt, { temperature: 0.6 })).trim()
}

/**
 * Personal key-point summary of a module.
 */
export async function summarizeModule(input: {
  apiKey: string
  moduleTitle: string
  content: string
}): Promise<string> {
  const { apiKey, moduleTitle, content } = input
  const prompt = `Ringkas modul marketing berikut menjadi poin-poin kunci yang mudah diingat. Gunakan Bahasa Indonesia.

JUDUL: ${moduleTitle}
ISI MODUL:
"""
${content.slice(0, 8000)}
"""

Berikan:
- 3-5 poin kunci terpenting (pakai tanda "-")
- 1 kalimat "kenapa ini penting untuk praktek"

Balas dalam teks biasa, ringkas dan padat.`

  return (await callGemini(apiKey, prompt, { temperature: 0.4 })).trim()
}

/**
 * Personalized recommendation for what to focus on next.
 */
export async function recommendNext(input: {
  apiKey: string
  completedTitles: string[]
  inProgressTitles: string[]
  avgScore: number | null
  weakestModule: string | null
}): Promise<string> {
  const { apiKey, completedTitles, inProgressTitles, avgScore, weakestModule } = input
  const prompt = `Kamu adalah AI Coach belajar marketing. Beri rekomendasi langkah belajar berikutnya yang personal. Gunakan Bahasa Indonesia, singkat dan memotivasi.

MODUL SELESAI: ${completedTitles.join(", ") || "belum ada"}
SEDANG DIPELAJARI: ${inProgressTitles.join(", ") || "belum ada"}
RATA-RATA SKOR TASK: ${avgScore !== null ? avgScore + "/100" : "belum ada"}
MODUL DENGAN SKOR TERLEMAH: ${weakestModule ?? "belum ada"}

Berikan 2-3 saran konkret langkah berikutnya (pakai tanda "-"), maksimal 5 kalimat. Sebut modul/topik spesifik jika relevan.`

  return (await callGemini(apiKey, prompt, { temperature: 0.6 })).trim()
}

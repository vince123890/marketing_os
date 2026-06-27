// Gemini 2.5 Flash integration (BYOK — user provides their own API key).
// The key is passed per-request and never stored server-side.

const GEMINI_MODEL = "gemini-2.5-flash"
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export interface AIFeedback {
  score: number
  feedback: string
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

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
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
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error("Gemini tidak mengembalikan respons.")

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

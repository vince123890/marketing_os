import AIKeyClient from "@/components/settings/AIKeyClient"

export default function AISettingsPage() {
  return (
    <div className="max-w-[640px] animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">AI Coach</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Hubungkan API key Gemini kamu sendiri untuk mendapat feedback & skor otomatis di setiap task.
        </p>
      </div>
      <AIKeyClient />
    </div>
  )
}

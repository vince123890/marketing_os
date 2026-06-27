import { createClient as createServiceClient } from "@supabase/supabase-js"
import { decrypt } from "@/lib/crypto"

/**
 * Fetch and decrypt a user's stored Gemini key. Returns null if none saved.
 * Uses the service role so the encrypted column is never exposed to the client.
 */
export async function getUserGeminiKey(userId: string): Promise<string | null> {
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await service
    .from("users")
    .select("gemini_api_key_encrypted")
    .eq("id", userId)
    .single()

  if (!data?.gemini_api_key_encrypted) return null
  try {
    return decrypt(data.gemini_api_key_encrypted)
  } catch {
    return null
  }
}

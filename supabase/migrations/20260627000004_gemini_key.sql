-- Store each user's own Gemini API key (BYOK), encrypted at the application layer.
-- The column holds AES-256-GCM ciphertext (iv:authTag:data, base64) — never plaintext.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS gemini_api_key_encrypted TEXT;

-- Create private storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can only upload to their own folder
CREATE POLICY "payment_proofs_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: Users can read own proofs; admins can read all
CREATE POLICY "payment_proofs_read_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (
        SELECT is_admin FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- RLS: Only service role can delete (no client delete allowed)

-- Fix: FOR ALL policies were missing WITH CHECK, which silently blocked all INSERTs.
-- Recreate each user-owned policy with both USING (read/update/delete) and
-- WITH CHECK (insert/update target rows).

DROP POLICY IF EXISTS "users_own" ON public.users;
CREATE POLICY "users_own" ON public.users
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "progress_own" ON public.user_progress;
CREATE POLICY "progress_own" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "submissions_own" ON public.task_submissions;
CREATE POLICY "submissions_own" ON public.task_submissions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_logs_own" ON public.daily_logs;
CREATE POLICY "daily_logs_own" ON public.daily_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_own" ON public.subscription_orders;
CREATE POLICY "orders_own" ON public.subscription_orders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "proofs_own" ON public.payment_proofs;
CREATE POLICY "proofs_own" ON public.payment_proofs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  current_plan  TEXT NOT NULL DEFAULT 'free' CHECK (current_plan IN ('free', 'trial', 'pro', 'lifetime')),
  streak_count  INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  learning_goal TEXT,
  daily_time_minutes INT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number   INT NOT NULL UNIQUE,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  content_markdown TEXT NOT NULL DEFAULT '',
  key_takeaway   TEXT NOT NULL DEFAULT '',
  is_published   BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TASKS (1 task per module)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id       UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  rubric          TEXT NOT NULL DEFAULT '',
  min_char_length INT NOT NULL DEFAULT 50,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USER PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id     UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started', 'in_progress', 'completed')),
  is_bookmarked BOOLEAN NOT NULL DEFAULT false,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- ============================================================
-- TASK SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id      UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  module_id    UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  ai_feedback  TEXT,
  score        INT CHECK (score >= 0 AND score <= 100),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DAILY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  log_date   DATE NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan        TEXT NOT NULL CHECK (plan IN ('pro', 'lifetime', 'trial')),
  period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_end  TIMESTAMPTZ,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SUBSCRIPTION ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscription_orders (
  id            TEXT PRIMARY KEY,  -- MOS-{timestamp}-{prefix}
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL CHECK (plan IN ('pro_monthly', 'lifetime')),
  amount        INT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending_payment'
                  CHECK (status IN ('pending_payment', 'waiting_verification', 'proof_rejected', 'paid', 'expired')),
  bank_name     TEXT NOT NULL,
  bank_account  TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PAYMENT PROOFS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          TEXT NOT NULL REFERENCES public.subscription_orders(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  storage_path      TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending_verification'
                      CHECK (status IN ('pending_verification', 'verified', 'rejected')),
  rejection_reason  TEXT,
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at       TIMESTAMPTZ,
  reviewed_by       UUID REFERENCES public.users(id)
);

-- Partial index for fast pending proof lookup
CREATE INDEX IF NOT EXISTS idx_payment_proofs_pending
  ON public.payment_proofs(order_id)
  WHERE status = 'pending_verification';

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module ON public.user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user ON public.task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task ON public.task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_user ON public.subscription_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON public.modules(order_number);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

-- Users: own row only
CREATE POLICY "users_own" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Modules: all authenticated users can read published
CREATE POLICY "modules_read" ON public.modules
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

-- Tasks: all authenticated users can read
CREATE POLICY "tasks_read" ON public.tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- User progress: own rows only
CREATE POLICY "progress_own" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Task submissions: own rows only
CREATE POLICY "submissions_own" ON public.task_submissions
  FOR ALL USING (auth.uid() = user_id);

-- Daily logs: own rows only
CREATE POLICY "daily_logs_own" ON public.daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: own rows only
CREATE POLICY "subscriptions_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Subscription orders: own rows only
CREATE POLICY "orders_own" ON public.subscription_orders
  FOR ALL USING (auth.uid() = user_id);

-- Payment proofs: own rows only
CREATE POLICY "proofs_own" ON public.payment_proofs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER daily_logs_updated_at BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

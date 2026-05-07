-- =====================================================================
-- Profiles table linked to auth.users
-- =====================================================================
-- IMPORTANT: We do NOT store passwords, verification tokens, reset tokens,
-- or email_verified flags. Supabase manages all of that in auth.users.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their OWN profile.
-- auth.uid() returns the user id from the JWT — works automatically with RLS.
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================================
-- Auto-create a profile row whenever a new user signs up.
-- This runs INSIDE auth schema with elevated privileges (SECURITY DEFINER),
-- which is the only safe way to insert into public.profiles for a new user
-- before they have a session.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- Auto-update updated_at timestamp
-- =====================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- Onboarding fields — operator's pairs / strategy / display name.
-- onboarded_at is null until the operator finishes the survey.
-- =====================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pairs        TEXT[]      NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS strategy     TEXT        NOT NULL DEFAULT 'smc',
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- Allow inserts so the upsert path in the onboarding action works even
-- if the auto-create trigger above hasn't fired yet (e.g. for legacy users).
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================================
-- Subscription tier — gates which strategies the operator can pick from.
-- Free: SMC only (the existing default; preserves access for current users).
-- Pro:  all 6 strategies.
-- Elite: same as Pro for now; reserved for future custom strategies.
--
-- Defaults to 'free' so legacy rows backfill safely. Tier flips via the
-- Lemon Squeezy webhook (Phase 4); until that's wired, flip manually in
-- Supabase Studio.
-- =====================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free'
    CHECK (tier IN ('free', 'pro', 'elite'));

-- Lemon Squeezy state. Populated by the LS webhook on subscription_created /
-- updated and cleared on subscription_cancelled / expired. All nullable —
-- free-tier users never have these set.
--   customer_portal_url: per-customer URL Lemon Squeezy returns in the
--     webhook payload. Drives the "Manage subscription" button in settings.
--   subscription_status: the LS status string ('active', 'cancelled',
--     'expired', 'on_trial', 'past_due', etc.) so we can surface the right
--     state in the settings panel without keeping our own enum in sync.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS customer_portal_url TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS current_period_ends_at TIMESTAMPTZ;

-- Matchday Ledger: Supabase schema migration
-- Run this in the Supabase SQL Editor (dashboard) or via psql.

-- 1. Slips table
CREATE TABLE IF NOT EXISTS public.slips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  stake NUMERIC(12,2) NOT NULL CHECK (stake > 0),
  games_count INTEGER NOT NULL CHECK (games_count >= 1),
  bookmaker TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  payout NUMERIC(12,2),
  net NUMERIC(12,2) GENERATED ALWAYS AS (
    CASE
      WHEN status = 'pending' THEN NULL
      ELSE COALESCE(payout, 0) - stake
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles table (loss limit & future profile data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_loss_limit NUMERIC(12,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for slips
CREATE POLICY "slips_select_own" ON public.slips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "slips_insert_own" ON public.slips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "slips_update_own" ON public.slips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "slips_delete_own" ON public.slips
  FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 6. Updated-at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Apply triggers
DROP TRIGGER IF EXISTS set_slips_updated_at ON public.slips;
CREATE TRIGGER set_slips_updated_at
  BEFORE UPDATE ON public.slips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. If migration was previously run without DEFAULT auth.uid(), apply this ALTER:
-- ALTER TABLE public.slips ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 9. Seed admin profile (run AFTER creating the user via Supabase Auth dashboard)
-- Replace the UUID below with the actual auth.users.id after creating the admin account.
-- INSERT INTO public.profiles (id) VALUES ('<auth-users-id>');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT 'Sukkur',
  area text NOT NULL DEFAULT '',
  blood_group text,
  is_donor boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  last_donation_date date,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- REQUESTS
CREATE TABLE public.blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name text NOT NULL DEFAULT '',
  blood_group text NOT NULL,
  units integer NOT NULL DEFAULT 1 CHECK (units > 0 AND units < 50),
  urgency text NOT NULL DEFAULT 'urgent' CHECK (urgency IN ('critical','urgent','standard')),
  hospital text NOT NULL,
  city text NOT NULL DEFAULT 'Sukkur',
  condition_summary text NOT NULL DEFAULT '',
  contact_phone text NOT NULL,
  contact_whatsapp text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','fulfilled','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_requests TO authenticated;
GRANT ALL ON public.blood_requests TO service_role;

ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view requests"
  ON public.blood_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own requests"
  ON public.blood_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users update own requests"
  ON public.blood_requests FOR UPDATE TO authenticated USING (auth.uid() = requester_id) WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users delete own requests"
  ON public.blood_requests FOR DELETE TO authenticated USING (auth.uid() = requester_id);

-- REPORTS
CREATE TABLE public.request_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, reporter_id)
);

GRANT SELECT, INSERT ON public.request_reports TO authenticated;
GRANT ALL ON public.request_reports TO service_role;

ALTER TABLE public.request_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view reports"
  ON public.request_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own reports"
  ON public.request_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX idx_requests_status ON public.blood_requests(status);
CREATE INDEX idx_profiles_donor ON public.profiles(is_donor, blood_group);

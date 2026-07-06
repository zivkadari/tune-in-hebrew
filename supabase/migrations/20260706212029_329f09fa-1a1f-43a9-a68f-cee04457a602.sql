-- =============================================
-- Daily Time Attack Mode - Complete Schema
-- =============================================

CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL DEFAULT 'שחקן ' || floor(random() * 9999 + 1)::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.daily_songs (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('song', 'artist')),
  answer TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  release_year INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  pool_order INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.daily_songs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.daily_time_attack_sets (
  date DATE PRIMARY KEY,
  song_ids INT[] NOT NULL,
  pool_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.daily_time_attack_sets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.daily_time_attack_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  run_type TEXT NOT NULL CHECK (run_type IN ('official', 'practice')),
  correct_count INT NOT NULL DEFAULT 0,
  elapsed_ms INT NOT NULL,
  effective_ms INT NOT NULL,
  completed_all_12 BOOLEAN NOT NULL DEFAULT false,
  skip_used BOOLEAN NOT NULL DEFAULT false,
  year_hint_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_unique_official_run ON public.daily_time_attack_runs (player_id, date) WHERE (run_type = 'official');
CREATE INDEX idx_runs_date_leaderboard ON public.daily_time_attack_runs (date, run_type, correct_count DESC, effective_ms ASC);
ALTER TABLE public.daily_time_attack_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 6)),
  created_by UUID REFERENCES public.players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, player_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _player_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group_id AND player_id = _player_id)
$$;

-- Public view without answers
CREATE OR REPLACE VIEW public.daily_songs_public WITH (security_invoker = on) AS
  SELECT id, type, audio_url, release_year, is_active, pool_order, created_at FROM public.daily_songs;

-- Final locked-down policies: no direct access, edge functions only
CREATE POLICY "No direct access" ON public.players FOR ALL USING (false);
CREATE POLICY "No direct access" ON public.daily_songs FOR ALL USING (false);
CREATE POLICY "No direct access" ON public.daily_time_attack_sets FOR ALL USING (false);
CREATE POLICY "No direct access" ON public.daily_time_attack_runs FOR ALL USING (false);
CREATE POLICY "No direct access" ON public.groups FOR ALL USING (false);
CREATE POLICY "No direct access" ON public.group_members FOR ALL USING (false);

-- Auth linkage
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_players_auth_user_id ON public.players(auth_user_id);

-- Seed songs (matches campaign audio files)
INSERT INTO public.daily_songs (id, type, answer, audio_url, release_year, is_active, pool_order) VALUES
(1, 'song', 'אהבה', '/audio/level10.m4a', 2015, true, 1),
(2, 'song', 'צליל מיתר', '/audio/level_new2.m4a', 2018, true, 2),
(3, 'song', 'סהרה', '/audio/level2.m4a', 2019, true, 3),
(4, 'song', 'לילות וקללות', '/audio/level3.m4a', 2016, true, 4),
(5, 'artist', 'דודו טסה', '/audio/level4.m4a', 2020, true, 5),
(6, 'song', 'מסע ומתן', '/audio/level5.m4a', 2017, true, 6),
(7, 'song', 'התקווה', '/audio/level6.m4a', 1948, true, 7),
(8, 'song', 'חופשייה', '/audio/level7.m4a', 2018, true, 8),
(9, 'artist', 'חנן בן ארי', '/audio/level8.m4a', 2019, true, 9),
(10, 'song', 'נגעת לי בלב', '/audio/level9.m4a', 2015, true, 10),
(11, 'artist', 'פאר טסי', '/audio/level1.m4a', 2017, true, 11),
(12, 'artist', 'עידן עמדי', '/audio/level11.m4a', 2018, true, 12),
(13, 'artist', 'אגם בוחבוט', '/audio/level12.m4a', 2019, true, 13),
(14, 'song', 'כל מה שיש לי', '/audio/level_new14.m4a', 2016, true, 14),
(15, 'song', 'פנתרה', '/audio/level_new15.m4a', 2020, true, 15),
(16, 'artist', 'אביב גפן', '/audio/level_new16.m4a', 2015, true, 16),
(17, 'song', 'אור גדול', '/audio/level_new17.m4a', 2017, true, 17),
(18, 'song', 'שווים', '/audio/level_new18.m4a', 2018, true, 18),
(19, 'artist', 'מירי מסיקה', '/audio/level_new19.m4a', 2016, true, 19),
(20, 'artist', 'אביתר בנאי', '/audio/level_new20.m4a', 2019, true, 20),
(21, 'song', 'נשימה', '/audio/level_new21.m4a', 2017, true, 21),
(22, 'artist', 'יוני בלוך', '/audio/level_new22.m4a', 2018, true, 22);

SELECT setval('daily_songs_id_seq', (SELECT MAX(id) FROM public.daily_songs));

-- Grants
GRANT ALL ON public.players TO service_role;
GRANT ALL ON public.daily_songs TO service_role;
GRANT ALL ON public.daily_time_attack_sets TO service_role;
GRANT ALL ON public.daily_time_attack_runs TO service_role;
GRANT ALL ON public.groups TO service_role;
GRANT ALL ON public.group_members TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.daily_songs_id_seq TO service_role;
GRANT SELECT ON public.daily_songs_public TO anon, authenticated, service_role;
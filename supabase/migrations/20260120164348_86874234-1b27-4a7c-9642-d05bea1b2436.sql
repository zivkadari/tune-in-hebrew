-- =============================================
-- Daily Time Attack Mode - Complete Schema
-- =============================================

-- 1. Players table (anonymous players with UUID)
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL DEFAULT 'שחקן ' || floor(random() * 9999 + 1)::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read players" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create player" ON public.players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update player" ON public.players
  FOR UPDATE USING (true);

-- 2. Daily Songs pool (the 60+ songs for daily challenges)
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

CREATE POLICY "Anyone can read songs" ON public.daily_songs
  FOR SELECT USING (true);

-- 3. Daily Time Attack Sets (the 12 songs for each day)
CREATE TABLE public.daily_time_attack_sets (
  date DATE PRIMARY KEY,
  song_ids INT[] NOT NULL,
  pool_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.daily_time_attack_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily sets" ON public.daily_time_attack_sets
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert daily sets" ON public.daily_time_attack_sets
  FOR INSERT WITH CHECK (true);

-- 4. Daily Time Attack Runs (player attempts)
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

-- Unique constraint: only one official run per player per day
CREATE UNIQUE INDEX idx_unique_official_run ON public.daily_time_attack_runs (player_id, date) 
  WHERE (run_type = 'official');

-- Index for leaderboard queries
CREATE INDEX idx_runs_date_leaderboard ON public.daily_time_attack_runs (date, run_type, correct_count DESC, effective_ms ASC);

ALTER TABLE public.daily_time_attack_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read runs" ON public.daily_time_attack_runs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert runs" ON public.daily_time_attack_runs
  FOR INSERT WITH CHECK (true);

-- 5. Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 6)),
  created_by UUID REFERENCES public.players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read groups" ON public.groups
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create groups" ON public.groups
  FOR INSERT WITH CHECK (true);

-- 6. Group Members (many-to-many relationship)
CREATE TABLE public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, player_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read members" ON public.group_members
  FOR SELECT USING (true);

CREATE POLICY "Anyone can join groups" ON public.group_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can leave groups" ON public.group_members
  FOR DELETE USING (true);

-- =============================================
-- Seed Data: 60 songs for the daily pool
-- =============================================

INSERT INTO public.daily_songs (type, answer, audio_url, release_year, pool_order) VALUES
-- Songs (guess the song name)
('song', 'שיר לשלום', '/audio/level1.m4a', 1969, 1),
('song', 'אהבה', '/audio/level2.m4a', 2015, 2),
('song', 'הללויה', '/audio/level3.m4a', 1979, 3),
('song', 'עוד יבוא שלום עלינו', '/audio/level4.m4a', 1973, 4),
('song', 'כנפי הרוח', '/audio/level5.m4a', 1981, 5),
('song', 'ירושלים של זהב', '/audio/level6.m4a', 1967, 6),
('song', 'יש לי כינור', '/audio/level7.m4a', 1972, 7),
('song', 'מה אברך', '/audio/level8.m4a', 1986, 8),
('song', 'אני ואתה', '/audio/level9.m4a', 1983, 9),
('song', 'לו יהי', '/audio/level10.m4a', 1973, 10),
('song', 'שיר משמר', '/audio/level11.m4a', 1991, 11),
('song', 'אבניבי', '/audio/level12.m4a', 1978, 12),
-- Artists (guess the artist)
('artist', 'נעמי שמר', '/audio/level_new2.m4a', 1967, 13),
('artist', 'אריק איינשטיין', '/audio/level_new14.m4a', 1970, 14),
('artist', 'שלמה ארצי', '/audio/level_new15.m4a', 1985, 15),
('artist', 'עברי לידר', '/audio/level_new16.m4a', 2000, 16),
('artist', 'רמי קלינשטיין', '/audio/level_new17.m4a', 1995, 17),
('artist', 'שלום חנוך', '/audio/level_new18.m4a', 1975, 18),
('artist', 'מאיר בנאי', '/audio/level_new19.m4a', 1988, 19),
('artist', 'דודו טסה', '/audio/level_new20.m4a', 2010, 20),
('artist', 'אסתר רדא', '/audio/level_new21.m4a', 2018, 21),
('artist', 'הדג נחש', '/audio/level_new22.m4a', 2003, 22),
-- More songs
('song', 'תפילה', '/audio/level1.m4a', 1982, 23),
('song', 'בואי נלך', '/audio/level2.m4a', 1990, 24),
('song', 'חלון קטן', '/audio/level3.m4a', 1975, 25),
('song', 'נדודי שינה', '/audio/level4.m4a', 2005, 26),
('song', 'עכשיו', '/audio/level5.m4a', 1998, 27),
('song', 'לילה לילה', '/audio/level6.m4a', 2001, 28),
('song', 'מכתב לאח', '/audio/level7.m4a', 1993, 29),
('song', 'יונה', '/audio/level8.m4a', 1980, 30),
('song', 'סתיו', '/audio/level9.m4a', 1977, 31),
('song', 'חופים', '/audio/level10.m4a', 2012, 32),
('song', 'בדרך אל הים', '/audio/level11.m4a', 1996, 33),
('song', 'מזל', '/audio/level12.m4a', 2008, 34),
-- More artists
('artist', 'יהודית רביץ', '/audio/level_new2.m4a', 1984, 35),
('artist', 'גידי גוב', '/audio/level_new14.m4a', 1987, 36),
('artist', 'ריטה', '/audio/level_new15.m4a', 1992, 37),
('artist', 'משינה', '/audio/level_new16.m4a', 1994, 38),
('artist', 'אתניקס', '/audio/level_new17.m4a', 1999, 39),
('artist', 'מוקי', '/audio/level_new18.m4a', 1989, 40),
('artist', 'בנזין', '/audio/level_new19.m4a', 1997, 41),
('artist', 'טיפקס', '/audio/level_new20.m4a', 2004, 42),
('artist', 'כנסיית השכל', '/audio/level_new21.m4a', 2007, 43),
('artist', 'שטארקר', '/audio/level_new22.m4a', 2015, 44),
-- Even more songs
('song', 'בוא', '/audio/level1.m4a', 2002, 45),
('song', 'נשיקה', '/audio/level2.m4a', 2011, 46),
('song', 'שמש', '/audio/level3.m4a', 1988, 47),
('song', 'רוח', '/audio/level4.m4a', 1976, 48),
('song', 'ים', '/audio/level5.m4a', 1974, 49),
('song', 'כוכב', '/audio/level6.m4a', 2006, 50),
('song', 'לב', '/audio/level7.m4a', 1991, 51),
('song', 'שיר ערש', '/audio/level8.m4a', 1965, 52),
('song', 'מנגינה', '/audio/level9.m4a', 2014, 53),
('song', 'צלילים', '/audio/level10.m4a', 2009, 54),
('song', 'מילים', '/audio/level11.m4a', 2016, 55),
('song', 'זמן', '/audio/level12.m4a', 2013, 56),
-- Final artists
('artist', 'סטטיק', '/audio/level_new2.m4a', 2017, 57),
('artist', 'נועה קירל', '/audio/level_new14.m4a', 2019, 58),
('artist', 'עדן בן זקן', '/audio/level_new15.m4a', 2018, 59),
('artist', 'עומר אדם', '/audio/level_new16.m4a', 2016, 60);
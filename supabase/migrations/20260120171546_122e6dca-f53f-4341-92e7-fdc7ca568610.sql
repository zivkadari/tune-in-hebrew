-- Fix: Clear incorrect data and insert correct song data from campaign
DELETE FROM daily_songs;

-- Insert songs that match the actual audio files from the campaign
INSERT INTO daily_songs (id, type, answer, audio_url, release_year, is_active, pool_order) VALUES
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

-- Clear the daily sets cache so it regenerates with correct songs
DELETE FROM daily_time_attack_sets;

-- Reset sequence for daily_songs
SELECT setval('daily_songs_id_seq', (SELECT MAX(id) FROM daily_songs));
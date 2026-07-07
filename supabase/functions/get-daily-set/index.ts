import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.91.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailySong {
  id: number;
  type: 'song' | 'artist';
  encrypted_answer: string;
  answer_hash: string; // SHA-256 hash for local verification
  audio_url: string;
  release_year: number;
  answer_pattern: number[]; // Length of each word
  answer_length: number;    // Total letters (excluding spaces)
  shuffled_letters: string[]; // Real answer letters + fake letters, shuffled
}

const TOTAL_BUBBLES = 14;
const HEBREW_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate random fake Hebrew letters that aren't in the existing set
 */
function generateFakeLetters(count: number, existingLetters: string[]): string[] {
  const fakes: string[] = [];
  const available = HEBREW_LETTERS.split('').filter(l => !existingLetters.includes(l));
  
  for (let i = 0; i < count; i++) {
    if (available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      fakes.push(available[idx]);
    } else {
      // If we run out, just pick random
      fakes.push(HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)]);
    }
  }
  return fakes;
}

interface DailySet {
  date: string;
  songs: DailySong[];
}

const SONGS_PER_DAY = 12;

/**
 * Derive AES-GCM encryption key ONCE (PBKDF2 is expensive - never per-song)
 */
async function deriveEncryptionKey(): Promise<CryptoKey> {
  const encryptionKey = Deno.env.get("ANSWER_ENCRYPTION_KEY");
  if (!encryptionKey) {
    throw new Error("Encryption key not configured");
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(encryptionKey),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("tune-in-hebrew-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
}

/**
 * Encrypt answer using AES-GCM with a pre-derived key
 */
async function encryptAnswerWithKey(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}


Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in Israel timezone (UTC+2/+3)
    const now = new Date();
    const israelOffset = 2 * 60; // Israel is UTC+2 (ignoring DST for simplicity)
    const israelTime = new Date(now.getTime() + israelOffset * 60 * 1000);
    const today = israelTime.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`[get-daily-set] Checking for daily set: ${today}`);

    // Check if we already have a set for today
    const { data: existingSet, error: fetchError } = await supabase
      .from('daily_time_attack_sets')
      .select('date, song_ids')
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected if no set exists yet
      console.error('[get-daily-set] Error fetching existing set:', fetchError);
      throw fetchError;
    }

    let songIds: number[];

    if (existingSet) {
      // Use existing set
      console.log(`[get-daily-set] Found existing set for ${today}`);
      songIds = existingSet.song_ids;
    } else {
      // Create new set for today
      console.log(`[get-daily-set] Creating new set for ${today}`);

      // Get all active songs ordered by pool_order
      const { data: allSongs, error: songsError } = await supabase
        .from('daily_songs')
        .select('id')
        .eq('is_active', true)
        .order('pool_order', { ascending: true });

      if (songsError) {
        console.error('[get-daily-set] Error fetching songs:', songsError);
        throw songsError;
      }

      if (!allSongs || allSongs.length < SONGS_PER_DAY) {
        throw new Error(`Not enough songs in pool. Need ${SONGS_PER_DAY}, have ${allSongs?.length || 0}`);
      }

      // Calculate which songs to use based on the day
      // We use a simple deterministic approach based on the date
      const daysSinceEpoch = Math.floor(new Date(today).getTime() / (1000 * 60 * 60 * 24));
      const poolSize = allSongs.length;
      const cycleDay = daysSinceEpoch % Math.ceil(poolSize / SONGS_PER_DAY);
      
      // Get the starting index for today's songs
      const startIndex = (cycleDay * SONGS_PER_DAY) % poolSize;
      
      // Select 12 songs starting from startIndex, wrapping around if needed
      songIds = [];
      for (let i = 0; i < SONGS_PER_DAY; i++) {
        const index = (startIndex + i) % poolSize;
        songIds.push(allSongs[index].id);
      }

      console.log(`[get-daily-set] Generated song IDs for ${today}:`, songIds);

      // Save the new set
      const { error: insertError } = await supabase
        .from('daily_time_attack_sets')
        .insert({
          date: today,
          song_ids: songIds,
          pool_version: 1
        });

      if (insertError) {
        // Another request might have created it simultaneously, try to fetch again
        console.log('[get-daily-set] Insert error (possibly race condition):', insertError);
        const { data: retrySet } = await supabase
          .from('daily_time_attack_sets')
          .select('song_ids')
          .eq('date', today)
          .single();
        
        if (retrySet) {
          songIds = retrySet.song_ids;
        } else {
          throw insertError;
        }
      }
    }

    // Now fetch the full song data for these IDs
    const { data: songs, error: songsDataError } = await supabase
      .from('daily_songs')
      .select('id, type, answer, audio_url, release_year')
      .in('id', songIds);

    if (songsDataError) {
      console.error('[get-daily-set] Error fetching song data:', songsDataError);
      throw songsDataError;
    }

    // Order songs according to songIds order and encrypt answers
    // Derive encryption key ONCE for all songs (PBKDF2 is expensive)
    const encryptionKey = await deriveEncryptionKey();

    const orderedSongs: DailySong[] = [];
    for (const id of songIds) {
      const song = songs!.find(s => s.id === id);
      if (song) {
        // Encrypt with the shared derived key (fast per-song)
        const encryptedAnswer = await encryptAnswerWithKey(song.answer, encryptionKey);

        
        // Calculate answer pattern (word lengths) without revealing the answer
        const words = song.answer.split(' ').filter((w: string) => w.length > 0);
        const answerPattern = words.map((w: string) => w.length);
        const answerLength = words.reduce((sum: number, w: string) => sum + w.length, 0);
        
        // Extract answer letters (without spaces) and create shuffled letter pool
        const answerLetters = song.answer.replace(/\s/g, '').split('');
        const fakeCount = Math.max(0, TOTAL_BUBBLES - answerLetters.length);
        const fakeLetters = generateFakeLetters(fakeCount, answerLetters);
        const shuffledLetters = shuffleArray([...answerLetters, ...fakeLetters]);
        
        // Create SHA-256 hash of answer (without spaces) for local verification
        const answerWithoutSpaces = song.answer.replace(/\s/g, '');
        const hashBuffer = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(answerWithoutSpaces)
        );
        const answerHash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        orderedSongs.push({
          id: song.id,
          type: song.type,
          encrypted_answer: encryptedAnswer,
          answer_hash: answerHash,
          audio_url: song.audio_url,
          release_year: song.release_year,
          answer_pattern: answerPattern,
          answer_length: answerLength,
          shuffled_letters: shuffledLetters,
        });
      }
    }

    const result: DailySet = {
      date: today,
      songs: orderedSongs
    };

    console.log(`[get-daily-set] Returning ${orderedSongs.length} songs for ${today} (answers encrypted)`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: unknown) {
    console.error('[get-daily-set] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

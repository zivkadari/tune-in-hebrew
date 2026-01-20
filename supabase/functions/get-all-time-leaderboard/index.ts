import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "GET" && req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional: Get current player from JWT if present
    let currentPlayerId: string | null = null;
    const authHeader = req.headers.get("Authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (authHeader?.startsWith("Bearer ")) {
      const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const token = authHeader.replace("Bearer ", "");
      const { data: authData } = await anonClient.auth.getUser(token);

      if (authData?.user) {
        const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: player } = await serviceClient
          .from("players")
          .select("id")
          .eq("auth_user_id", authData.user.id)
          .single();

        if (player) {
          currentPlayerId = player.id;
        }
      }
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the best run for each player (ever)
    // For each player, we want their best performance: highest correct_count, then lowest effective_ms
    const { data: allRuns, error: runsError } = await supabase
      .from("daily_time_attack_runs")
      .select("player_id, correct_count, effective_ms, date, created_at")
      .eq("run_type", "official")
      .order("correct_count", { ascending: false })
      .order("effective_ms", { ascending: true })
      .order("created_at", { ascending: true });

    if (runsError) {
      console.error("Error fetching runs:", runsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch leaderboard" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get best run per player (first occurrence since already sorted)
    const playerBestRuns = new Map<string, typeof allRuns[0]>();
    for (const run of allRuns || []) {
      if (!playerBestRuns.has(run.player_id)) {
        playerBestRuns.set(run.player_id, run);
      }
    }

    // Convert to array and sort
    const bestRuns = Array.from(playerBestRuns.values())
      .sort((a, b) => {
        if (b.correct_count !== a.correct_count) {
          return b.correct_count - a.correct_count;
        }
        return a.effective_ms - b.effective_ms;
      })
      .slice(0, 50);

    // Get player names
    const playerIds = bestRuns.map(r => r.player_id);
    const { data: players } = await supabase
      .from("players")
      .select("id, display_name")
      .in("id", playerIds);

    const playerMap = new Map((players || []).map(p => [p.id, p.display_name]));

    // Build leaderboard with ranks
    const leaderboard = bestRuns.map((run, idx) => ({
      rank: idx + 1,
      player_id: run.player_id,
      display_name: playerMap.get(run.player_id) || "שחקן אנונימי",
      correct_count: run.correct_count,
      effective_ms: run.effective_ms,
      date: run.date,
      created_at: run.created_at,
      is_current_player: currentPlayerId ? run.player_id === currentPlayerId : false
    }));

    // If current player is not in top 50, find their rank
    let currentPlayerEntry = null;
    if (currentPlayerId && !leaderboard.find(e => e.is_current_player)) {
      const currentPlayerBest = playerBestRuns.get(currentPlayerId);
      if (currentPlayerBest) {
        // Calculate rank
        const allSorted = Array.from(playerBestRuns.values())
          .sort((a, b) => {
            if (b.correct_count !== a.correct_count) {
              return b.correct_count - a.correct_count;
            }
            return a.effective_ms - b.effective_ms;
          });
        
        const rank = allSorted.findIndex(r => r.player_id === currentPlayerId) + 1;
        
        currentPlayerEntry = {
          rank,
          player_id: currentPlayerId,
          display_name: playerMap.get(currentPlayerId) || "שחקן אנונימי",
          correct_count: currentPlayerBest.correct_count,
          effective_ms: currentPlayerBest.effective_ms,
          date: currentPlayerBest.date,
          created_at: currentPlayerBest.created_at,
          is_current_player: true
        };
      }
    }

    console.log(`Retrieved all-time leaderboard with ${leaderboard.length} entries`);

    return new Response(
      JSON.stringify({ 
        leaderboard,
        current_player_entry: currentPlayerEntry
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

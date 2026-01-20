import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-player-id",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow GET
    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get date from query string
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    
    if (!date) {
      return new Response(
        JSON.stringify({ error: "Date parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(
        JSON.stringify({ error: "Invalid date format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get player ID from header (optional - for marking current player)
    const playerId = req.headers.get("x-player-id");

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get top 50 runs for the date, joined with player names
    const { data: runs, error } = await supabase
      .from("daily_time_attack_runs")
      .select(`
        player_id,
        correct_count,
        effective_ms,
        created_at
      `)
      .eq("date", date)
      .eq("run_type", "official")
      .order("correct_count", { ascending: false })
      .order("effective_ms", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch leaderboard" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get player names for the runs (only visible data)
    const playerIds = [...new Set((runs || []).map(r => r.player_id))];
    
    const { data: players } = await supabase
      .from("players")
      .select("id, display_name")
      .in("id", playerIds);

    const playerMap = new Map((players || []).map(p => [p.id, p.display_name]));

    // Build leaderboard with ranks
    const leaderboard = (runs || []).map((run, idx) => ({
      rank: idx + 1,
      player_id: run.player_id,
      display_name: playerMap.get(run.player_id) || "שחקן אנונימי",
      correct_count: run.correct_count,
      effective_ms: run.effective_ms,
      created_at: run.created_at,
      is_current_player: playerId ? run.player_id === playerId : false
    }));

    return new Response(
      JSON.stringify({ leaderboard }),
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

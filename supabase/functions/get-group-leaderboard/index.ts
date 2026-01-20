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

    // Get parameters
    const url = new URL(req.url);
    const groupId = url.searchParams.get("group_id");
    const date = url.searchParams.get("date"); // Optional - if not provided, returns all-time

    if (!groupId) {
      return new Response(
        JSON.stringify({ error: "group_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify JWT
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !authData?.user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get player ID from auth user
    const { data: player, error: playerError } = await serviceClient
      .from("players")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (playerError || !player) {
      console.error("Player lookup error:", playerError);
      return new Response(
        JSON.stringify({ error: "Player not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if player is a member of this group
    const { data: membership, error: membershipError } = await serviceClient
      .from("group_members")
      .select("player_id")
      .eq("group_id", groupId)
      .eq("player_id", player.id)
      .single();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: "You are not a member of this group" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all members of the group
    const { data: members, error: membersError } = await serviceClient
      .from("group_members")
      .select("player_id")
      .eq("group_id", groupId);

    if (membersError || !members || members.length === 0) {
      console.error("Members fetch error:", membersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch group members" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const memberPlayerIds = members.map(m => m.player_id);

    // Build query for runs
    let runsQuery = serviceClient
      .from("daily_time_attack_runs")
      .select("player_id, correct_count, effective_ms, date, created_at")
      .in("player_id", memberPlayerIds)
      .eq("run_type", "official")
      .order("correct_count", { ascending: false })
      .order("effective_ms", { ascending: true })
      .order("created_at", { ascending: true });

    // If date is provided, filter by date (daily leaderboard)
    if (date) {
      runsQuery = runsQuery.eq("date", date);
    }

    const { data: runs, error: runsError } = await runsQuery;

    if (runsError) {
      console.error("Runs fetch error:", runsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch leaderboard" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For all-time: get best run per player
    // For daily: just rank them as-is
    let rankedRuns: typeof runs;
    
    if (date) {
      // Daily: already sorted, just take first per player
      rankedRuns = runs || [];
    } else {
      // All-time: get best run per player
      const playerBestRuns = new Map<string, typeof runs[0]>();
      for (const run of runs || []) {
        if (!playerBestRuns.has(run.player_id)) {
          playerBestRuns.set(run.player_id, run);
        }
      }
      rankedRuns = Array.from(playerBestRuns.values())
        .sort((a, b) => {
          if (b.correct_count !== a.correct_count) {
            return b.correct_count - a.correct_count;
          }
          return a.effective_ms - b.effective_ms;
        });
    }

    // Get player names
    const { data: players } = await serviceClient
      .from("players")
      .select("id, display_name")
      .in("id", memberPlayerIds);

    const playerMap = new Map((players || []).map(p => [p.id, p.display_name]));

    // Build leaderboard
    const leaderboard = rankedRuns.map((run, idx) => ({
      rank: idx + 1,
      player_id: run.player_id,
      display_name: playerMap.get(run.player_id) || "שחקן אנונימי",
      correct_count: run.correct_count,
      effective_ms: run.effective_ms,
      date: run.date,
      created_at: run.created_at,
      is_current_player: run.player_id === player.id
    }));

    // Get group name
    const { data: group } = await serviceClient
      .from("groups")
      .select("name")
      .eq("id", groupId)
      .single();

    console.log(`Retrieved group leaderboard for group ${groupId} with ${leaderboard.length} entries`);

    return new Response(
      JSON.stringify({ 
        leaderboard,
        group_name: group?.name || "קבוצה",
        is_all_time: !date
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RunData {
  date: string;
  run_type: "official" | "practice";
  correct_count: number;
  elapsed_ms: number;
  effective_ms: number;
  completed_all_12: boolean;
  skip_used: boolean;
  year_hint_used: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate auth - require JWT
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
    
    // Validate JWT with anon client
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !authData.user) {
      console.log("Auth failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authUserId = authData.user.id;

    // Use service role client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get player by auth_user_id
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (playerError || !player) {
      console.error("Player not found for auth user:", authUserId);
      return new Response(
        JSON.stringify({ error: "Player not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const playerId = player.id;

    // Parse request body
    const body: RunData = await req.json();

    // Validate required fields
    if (!body.date || !body.run_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return new Response(
        JSON.stringify({ error: "Invalid date format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate run_type
    if (!["official", "practice"].includes(body.run_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid run type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate numeric fields
    if (typeof body.correct_count !== "number" || body.correct_count < 0 || body.correct_count > 12) {
      return new Response(
        JSON.stringify({ error: "Invalid correct_count" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof body.elapsed_ms !== "number" || body.elapsed_ms < 0 || body.elapsed_ms > 120000) {
      return new Response(
        JSON.stringify({ error: "Invalid elapsed_ms" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof body.effective_ms !== "number" || body.effective_ms < 0 || body.effective_ms > 120000) {
      return new Response(
        JSON.stringify({ error: "Invalid effective_ms" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if official run already exists for today
    if (body.run_type === "official") {
      const { data: existingRun } = await supabase
        .from("daily_time_attack_runs")
        .select("id")
        .eq("player_id", playerId)
        .eq("date", body.date)
        .eq("run_type", "official")
        .single();

      if (existingRun) {
        return new Response(
          JSON.stringify({ error: "Official run already exists for today" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Insert the run
    const { data: newRun, error: insertError } = await supabase
      .from("daily_time_attack_runs")
      .insert({
        player_id: playerId,
        date: body.date,
        run_type: body.run_type,
        correct_count: body.correct_count,
        elapsed_ms: body.elapsed_ms,
        effective_ms: body.effective_ms,
        completed_all_12: body.completed_all_12 ?? false,
        skip_used: body.skip_used ?? false,
        year_hint_used: body.year_hint_used ?? false
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving run:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save run" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Saved ${body.run_type} run for player ${playerId}: ${body.correct_count} correct`);

    return new Response(
      JSON.stringify({ success: true, run: newRun }),
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-player-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

    // Get player ID from header
    const playerId = req.headers.get("x-player-id");
    if (!playerId) {
      return new Response(
        JSON.stringify({ error: "Missing player ID" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(playerId)) {
      return new Response(
        JSON.stringify({ error: "Invalid player ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { join_code } = body;

    // Validate join_code
    if (!join_code || typeof join_code !== "string") {
      return new Response(
        JSON.stringify({ error: "Join code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize join_code - should be 6 uppercase alphanumeric characters
    const sanitizedCode = join_code.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(sanitizedCode)) {
      return new Response(
        JSON.stringify({ error: "Invalid join code format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify player exists
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id")
      .eq("id", playerId)
      .single();

    if (playerError || !player) {
      console.error("Player not found:", playerError);
      return new Response(
        JSON.stringify({ error: "Player not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find group by join_code
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, name")
      .eq("join_code", sanitizedCode)
      .single();

    if (groupError || !group) {
      console.error("Group not found:", groupError);
      return new Response(
        JSON.stringify({ error: "Group not found with that code" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("group_id", group.id)
      .eq("player_id", playerId)
      .single();

    if (existingMember) {
      return new Response(
        JSON.stringify({ error: "Already a member of this group", group }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add player to group
    const { error: joinError } = await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        player_id: playerId
      });

    if (joinError) {
      console.error("Error joining group:", joinError);
      return new Response(
        JSON.stringify({ error: "Failed to join group" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Player ${playerId} joined group ${group.id}`);

    return new Response(
      JSON.stringify({ success: true, group }),
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

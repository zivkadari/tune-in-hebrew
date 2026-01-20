import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const body = await req.json();
    const { name } = body;

    // Validate name
    if (!name || typeof name !== "string") {
      return new Response(
        JSON.stringify({ error: "Group name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize and validate name length
    const sanitizedName = name.trim();
    if (sanitizedName.length < 1 || sanitizedName.length > 50) {
      return new Response(
        JSON.stringify({ error: "Group name must be between 1 and 50 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({ name: sanitizedName, created_by: playerId })
      .select()
      .single();

    if (groupError) {
      console.error("Error creating group:", groupError);
      return new Response(
        JSON.stringify({ error: "Failed to create group" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auto-join creator to the group
    const { error: joinError } = await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        player_id: playerId
      });

    if (joinError) {
      console.error("Error joining group:", joinError);
      // Group was created but join failed - still return success but warn
      return new Response(
        JSON.stringify({ success: true, group, warning: "Created but could not auto-join" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[create-group] Player ${playerId} created group ${group.id}`);

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

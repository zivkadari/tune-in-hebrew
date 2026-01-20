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
    // Parse request
    const url = new URL(req.url);
    const groupId = url.searchParams.get("group_id");

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

    // Get player ID from auth user
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

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

    // Get group details to check if player is creator
    const { data: group, error: groupError } = await serviceClient
      .from("groups")
      .select("id, name, join_code, created_by")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      console.error("Group lookup error:", groupError);
      return new Response(
        JSON.stringify({ error: "Group not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isCreator = group.created_by === player.id;

    // Get all members of the group
    const { data: members, error: membersError } = await serviceClient
      .from("group_members")
      .select("player_id, joined_at")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });

    if (membersError) {
      console.error("Members fetch error:", membersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch members" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get player names
    const playerIds = members.map(m => m.player_id);
    const { data: players, error: playersError } = await serviceClient
      .from("players")
      .select("id, display_name")
      .in("id", playerIds);

    if (playersError) {
      console.error("Players fetch error:", playersError);
    }

    const playerMap = new Map((players || []).map(p => [p.id, p.display_name]));

    // Build response with member details
    const membersWithNames = members.map(m => ({
      player_id: m.player_id,
      display_name: playerMap.get(m.player_id) || "שחקן אנונימי",
      joined_at: m.joined_at,
      is_creator: m.player_id === group.created_by
    }));

    console.log(`Retrieved ${membersWithNames.length} members for group ${groupId}`);

    return new Response(
      JSON.stringify({
        group: {
          id: group.id,
          name: group.name,
          join_code: group.join_code,
          created_by: group.created_by
        },
        members: membersWithNames,
        is_creator: isCreator,
        current_player_id: player.id
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

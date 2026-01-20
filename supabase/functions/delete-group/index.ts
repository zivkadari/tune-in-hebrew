import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authUserId = claimsData.claims.sub;
    console.log("Authenticated user:", authUserId);

    // Parse request body
    const { group_id } = await req.json();
    
    if (!group_id) {
      return new Response(
        JSON.stringify({ error: "group_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Deleting group:", group_id);

    // Create admin client to bypass RLS
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get player_id from auth_user_id
    const { data: player, error: playerError } = await adminClient
      .from("players")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (playerError || !player) {
      console.error("Player lookup error:", playerError);
      return new Response(
        JSON.stringify({ error: "Player not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const playerId = player.id;
    console.log("Player ID:", playerId);

    // Get group and verify the player is the creator
    const { data: group, error: groupError } = await adminClient
      .from("groups")
      .select("id, created_by, name")
      .eq("id", group_id)
      .maybeSingle();

    if (groupError || !group) {
      console.error("Group lookup error:", groupError);
      return new Response(
        JSON.stringify({ error: "Group not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if player is the creator
    if (group.created_by !== playerId) {
      console.error("Player is not the creator. Player:", playerId, "Creator:", group.created_by);
      return new Response(
        JSON.stringify({ error: "Only the group creator can delete the group" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Player is creator, proceeding with deletion");

    // Delete all members from the group first
    const { error: membersDeleteError } = await adminClient
      .from("group_members")
      .delete()
      .eq("group_id", group_id);

    if (membersDeleteError) {
      console.error("Error deleting group members:", membersDeleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete group members" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Deleted all group members");

    // Delete the group
    const { error: groupDeleteError } = await adminClient
      .from("groups")
      .delete()
      .eq("id", group_id);

    if (groupDeleteError) {
      console.error("Error deleting group:", groupDeleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete group" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Group deleted successfully:", group.name);

    return new Response(
      JSON.stringify({ success: true, message: "Group deleted successfully" }),
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

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
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { group_id, player_id_to_remove } = await req.json();

    if (!group_id || !player_id_to_remove) {
      return new Response(
        JSON.stringify({ error: "group_id and player_id_to_remove are required" }),
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

    // Get group details
    const { data: group, error: groupError } = await serviceClient
      .from("groups")
      .select("id, name, created_by")
      .eq("id", group_id)
      .single();

    if (groupError || !group) {
      console.error("Group lookup error:", groupError);
      return new Response(
        JSON.stringify({ error: "Group not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the requesting player is the group creator
    if (group.created_by !== player.id) {
      return new Response(
        JSON.stringify({ error: "Only the group creator can remove members" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cannot remove the creator themselves
    if (player_id_to_remove === group.created_by) {
      return new Response(
        JSON.stringify({ error: "Cannot remove the group creator" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if player_id_to_remove is actually a member
    const { data: targetMembership, error: memberCheckError } = await serviceClient
      .from("group_members")
      .select("player_id")
      .eq("group_id", group_id)
      .eq("player_id", player_id_to_remove)
      .single();

    if (memberCheckError || !targetMembership) {
      return new Response(
        JSON.stringify({ error: "Player is not a member of this group" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Remove the member
    const { error: deleteError } = await serviceClient
      .from("group_members")
      .delete()
      .eq("group_id", group_id)
      .eq("player_id", player_id_to_remove);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to remove member" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Player ${player.id} removed player ${player_id_to_remove} from group ${group_id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Member removed successfully" }),
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

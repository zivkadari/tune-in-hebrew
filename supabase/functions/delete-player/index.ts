import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create anon client to verify JWT
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for database operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the player for this auth user
    const { data: player, error: playerError } = await serviceClient
      .from('players')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (playerError || !player) {
      console.error('Player not found:', playerError);
      return new Response(
        JSON.stringify({ error: 'Player not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const playerId = player.id;
    console.log(`Starting deletion process for player ${playerId}`);

    // Step 1: Find all groups created by this player
    const { data: createdGroups, error: groupsError } = await serviceClient
      .from('groups')
      .select('id')
      .eq('created_by', playerId);

    if (groupsError) {
      console.error('Error finding groups:', groupsError);
    }

    // Step 2: Delete all members from groups created by this player
    if (createdGroups && createdGroups.length > 0) {
      const groupIds = createdGroups.map(g => g.id);
      console.log(`Deleting members from ${groupIds.length} groups created by player`);
      
      const { error: deleteMembersError } = await serviceClient
        .from('group_members')
        .delete()
        .in('group_id', groupIds);

      if (deleteMembersError) {
        console.error('Error deleting group members:', deleteMembersError);
      }

      // Step 3: Delete the groups themselves
      const { error: deleteGroupsError } = await serviceClient
        .from('groups')
        .delete()
        .in('id', groupIds);

      if (deleteGroupsError) {
        console.error('Error deleting groups:', deleteGroupsError);
      }
    }

    // Step 4: Remove player from all other groups they're a member of
    const { error: leaveGroupsError } = await serviceClient
      .from('group_members')
      .delete()
      .eq('player_id', playerId);

    if (leaveGroupsError) {
      console.error('Error leaving groups:', leaveGroupsError);
    }

    // Step 5: Delete all daily time attack runs
    const { error: deleteRunsError } = await serviceClient
      .from('daily_time_attack_runs')
      .delete()
      .eq('player_id', playerId);

    if (deleteRunsError) {
      console.error('Error deleting runs:', deleteRunsError);
    }

    // Step 6: Delete the player record
    const { error: deletePlayerError } = await serviceClient
      .from('players')
      .delete()
      .eq('id', playerId);

    if (deletePlayerError) {
      console.error('Error deleting player:', deletePlayerError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete player' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully deleted player ${playerId} and all associated data`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

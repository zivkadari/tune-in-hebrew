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

    const { group_id } = await req.json();

    if (!group_id) {
      return new Response(
        JSON.stringify({ error: 'group_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Check if the player is the creator of this group
    const { data: group, error: groupError } = await serviceClient
      .from('groups')
      .select('created_by')
      .eq('id', group_id)
      .single();

    if (groupError) {
      console.error('Group not found:', groupError);
      return new Response(
        JSON.stringify({ error: 'Group not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Creator cannot leave their own group
    if (group.created_by === player.id) {
      return new Response(
        JSON.stringify({ error: 'יוצר הקבוצה לא יכול לעזוב את הקבוצה. ניתן למחוק את החשבון דרך ההגדרות.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if player is a member of this group
    const { data: membership, error: membershipError } = await serviceClient
      .from('group_members')
      .select('player_id')
      .eq('group_id', group_id)
      .eq('player_id', player.id)
      .single();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: 'אתה לא חבר בקבוצה זו' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove the player from the group
    const { error: deleteError } = await serviceClient
      .from('group_members')
      .delete()
      .eq('group_id', group_id)
      .eq('player_id', player.id);

    if (deleteError) {
      console.error('Error leaving group:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to leave group' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Player ${player.id} left group ${group_id}`);

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

-- ============================================================
-- PATXANGA - DIRECT INVITE DECLINE TEST
-- Version: 1.0
-- ============================================================

do $$
declare
    v_host_user uuid := gen_random_uuid();
    v_guest_user uuid := gen_random_uuid();
    v_create_result jsonb;
    v_match_id uuid;
    v_host_player_id uuid;
    v_invite_result jsonb;
    v_invite_id uuid;
    v_decline_result jsonb;
begin
    v_create_result := public.create_patxanga_match_lobby(
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_turn_time_seconds := null,
        p_hint_mode_enabled := false,
        p_host_user_id := v_host_user,
        p_host_guest_name := null,
        p_max_players := 4
    );

    v_match_id := (v_create_result->>'match_id')::uuid;
    v_host_player_id := (v_create_result->>'host_player_id')::uuid;

    v_invite_result := public.invite_patxanga_player(
        p_match_id := v_match_id,
        p_invited_by_player_id := v_host_player_id,
        p_invited_user_id := v_guest_user,
        p_expires_at := null
    );

    v_invite_id := (v_invite_result->>'invite_id')::uuid;

    v_decline_result := public.decline_patxanga_invite(
        p_invite_id := v_invite_id,
        p_user_id := v_guest_user
    );

    raise notice 'Decline result: %', v_decline_result;

    raise notice 'Invite status: %',
    (
        select status
        from patxanga_match_invites
        where id = v_invite_id
    );

    raise notice 'Players in match: %',
    (
        select count(*)
        from patxanga_players
        where match_id = v_match_id
    );
end $$;

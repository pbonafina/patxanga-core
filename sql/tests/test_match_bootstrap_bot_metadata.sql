-- ============================================================
-- PATXANGA - TEST: match bootstrap bot metadata
-- Purpose: frontend can identify bot players for human-vs-bot MVP
-- ============================================================

do $$
declare
    v_human_user_id uuid := gen_random_uuid();
    v_bot_user_id uuid := gen_random_uuid();
    v_match_id uuid;
    v_bot_player_id uuid;
    v_bootstrap jsonb;
    v_bot_summary_count integer;
begin
    v_match_id := public.create_patxanga_match(
        p_host_user_id := v_human_user_id,
        p_host_guest_name := 'Human SQL',
        p_language := 'pt-BR',
        p_match_mode := 'synchronous',
        p_max_players := 2
    );

    v_bot_player_id := public.join_patxanga_match(
        p_match_id := v_match_id,
        p_user_id := v_bot_user_id,
        p_guest_name := 'Bot Easy',
        p_is_bot := true,
        p_bot_level := 'easy',
        p_bot_profile := 'balanced'
    );

    perform public.start_patxanga_match(v_match_id);

    v_bootstrap := public.get_patxanga_match_bootstrap(v_match_id, v_human_user_id);

    if v_bootstrap->>'language' <> 'pt-BR' then
        raise exception 'Expected bootstrap language pt-BR, got %', v_bootstrap;
    end if;

    if coalesce((v_bootstrap->'player_context'->>'is_bot')::boolean, true) is not false then
        raise exception 'Expected human player_context.is_bot=false, got %', v_bootstrap;
    end if;

    select count(*)
    into v_bot_summary_count
    from jsonb_array_elements(v_bootstrap->'players_summary') player
    where (player->>'player_id')::uuid = v_bot_player_id
      and (player->>'is_bot')::boolean is true
      and player->>'bot_level' = 'easy'
      and player->>'bot_profile' = 'balanced';

    if v_bot_summary_count <> 1 then
        raise exception 'Expected one bot player summary with metadata, got % in %',
            v_bot_summary_count,
            v_bootstrap;
    end if;

    raise notice 'Match bootstrap bot metadata test passed';
    raise notice 'match_id=% bot_player_id=%', v_match_id, v_bot_player_id;
end $$;

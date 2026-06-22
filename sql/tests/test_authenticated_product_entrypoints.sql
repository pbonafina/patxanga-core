do $$
declare
    v_host_user_id uuid := gen_random_uuid();
    v_guest_user_id uuid := gen_random_uuid();
    v_intruder_user_id uuid := gen_random_uuid();
    v_lobby_result jsonb;
    v_invite_result jsonb;
    v_pending_invites jsonb;
    v_resumable_matches jsonb;
    v_accept_result jsonb;
    v_resume_result jsonb;
    v_start_result jsonb;
    v_match_id uuid;
    v_invite_id uuid;
    v_intruder_blocked boolean := false;
begin
    if has_function_privilege(
        'anon',
        'public.accept_patxanga_my_invite(uuid)',
        'execute'
    ) then
        raise exception 'Expected anon role not to execute authenticated invite RPC';
    end if;

    perform set_config('request.jwt.claim.sub', v_host_user_id::text, true);

    v_lobby_result := public.create_patxanga_my_match_lobby(
        'pt-BR',
        'synchronous',
        null,
        false,
        'Auth Host',
        4
    );
    v_match_id := (v_lobby_result->>'match_id')::uuid;

    if not exists (
        select 1
        from public.patxanga_matches
        where id = v_match_id
          and host_user_id = v_host_user_id
    ) then
        raise exception 'Expected authenticated host_user_id to own created lobby';
    end if;

    v_invite_result := public.invite_patxanga_my_player(
        v_match_id,
        v_guest_user_id,
        null
    );
    v_invite_id := (v_invite_result->>'invite_id')::uuid;

    perform set_config('request.jwt.claim.sub', v_intruder_user_id::text, true);

    begin
        perform public.accept_patxanga_my_invite(v_invite_id);
    exception
        when others then
            v_intruder_blocked := true;
    end;

    if not v_intruder_blocked then
        raise exception 'Expected authenticated intruder not to accept another user invite';
    end if;

    perform set_config('request.jwt.claim.sub', v_guest_user_id::text, true);

    v_pending_invites := public.list_patxanga_my_pending_invites();

    if jsonb_array_length(v_pending_invites) <> 1 then
        raise exception 'Expected guest to see one pending invite, got %', v_pending_invites;
    end if;

    v_accept_result := public.accept_patxanga_my_invite(v_invite_id);

    if v_accept_result->>'invite_status' <> 'accepted' then
        raise exception 'Expected authenticated invite acceptance, got %', v_accept_result;
    end if;

    v_resume_result := public.resume_patxanga_my_match(v_match_id);

    if coalesce((v_resume_result->>'can_resume')::boolean, false) is not true then
        raise exception 'Expected guest to resume authenticated match, got %', v_resume_result;
    end if;

    v_resumable_matches := public.list_patxanga_my_resumable_matches();

    if jsonb_array_length(v_resumable_matches) <> 1 then
        raise exception 'Expected guest to see one resumable match, got %', v_resumable_matches;
    end if;

    perform set_config('request.jwt.claim.sub', v_host_user_id::text, true);

    v_start_result := public.start_patxanga_my_match_from_lobby(v_match_id);

    if v_start_result->>'lobby_status' <> 'started' then
        raise exception 'Expected authenticated host to start lobby, got %', v_start_result;
    end if;

    raise notice 'Authenticated product entrypoints test passed';
    raise notice 'match_id=% invite_id=%', v_match_id, v_invite_id;
end;
$$;

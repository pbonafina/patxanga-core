-- ============================================================
-- PATXANGA - Authenticated product entrypoints
-- Purpose: expose production-facing RPCs that derive user identity from auth.uid()
-- ============================================================

create or replace function public.require_patxanga_authenticated_user()
returns uuid
language plpgsql
stable
security invoker
as
$$
declare
    v_user_id uuid;
begin
    v_user_id := auth.uid();

    if v_user_id is null then
        raise exception 'Authentication required';
    end if;

    return v_user_id;
end;
$$;

revoke all on function public.require_patxanga_authenticated_user()
from public, anon, authenticated;

grant execute on function public.require_patxanga_authenticated_user()
to authenticated;

create or replace function public.get_patxanga_authenticated_player_id(
    p_match_id uuid
)
returns uuid
language plpgsql
stable
security definer
as
$$
declare
    v_user_id uuid;
    v_player_id uuid;
begin
    v_user_id := public.require_patxanga_authenticated_user();

    select id
    into v_player_id
    from public.patxanga_players
    where match_id = p_match_id
      and user_id = v_user_id
    limit 1;

    if v_player_id is null then
        raise exception 'Authenticated user is not a player in this match';
    end if;

    return v_player_id;
end;
$$;

revoke all on function public.get_patxanga_authenticated_player_id(uuid)
from public, anon, authenticated;

grant execute on function public.get_patxanga_authenticated_player_id(uuid)
to authenticated;

create or replace function public.create_patxanga_my_match(
    p_language text,
    p_match_mode text default 'synchronous',
    p_turn_time_seconds integer default null,
    p_hint_mode_enabled boolean default false,
    p_host_guest_name text default null,
    p_max_players integer default 4
)
returns uuid
language plpgsql
security definer
as
$$
begin
    return public.create_patxanga_match(
        p_language := p_language,
        p_match_mode := p_match_mode,
        p_turn_time_seconds := p_turn_time_seconds,
        p_hint_mode_enabled := p_hint_mode_enabled,
        p_host_user_id := public.require_patxanga_authenticated_user(),
        p_host_guest_name := p_host_guest_name,
        p_max_players := p_max_players
    );
end;
$$;

grant execute on function public.create_patxanga_my_match(
    text,
    text,
    integer,
    boolean,
    text,
    integer
) to authenticated;

create or replace function public.create_patxanga_my_match_lobby(
    p_language text,
    p_match_mode text default 'synchronous',
    p_turn_time_seconds integer default null,
    p_hint_mode_enabled boolean default false,
    p_host_guest_name text default null,
    p_max_players integer default 4
)
returns jsonb
language plpgsql
security definer
as
$$
begin
    return public.create_patxanga_match_lobby(
        p_language := p_language,
        p_match_mode := p_match_mode,
        p_turn_time_seconds := p_turn_time_seconds,
        p_hint_mode_enabled := p_hint_mode_enabled,
        p_host_user_id := public.require_patxanga_authenticated_user(),
        p_host_guest_name := p_host_guest_name,
        p_max_players := p_max_players
    );
end;
$$;

grant execute on function public.create_patxanga_my_match_lobby(
    text,
    text,
    integer,
    boolean,
    text,
    integer
) to authenticated;

create or replace function public.invite_patxanga_my_player(
    p_match_id uuid,
    p_invited_user_id uuid,
    p_expires_at timestamp default null
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_inviter_player_id uuid;
begin
    v_inviter_player_id := public.get_patxanga_authenticated_player_id(p_match_id);

    return public.invite_patxanga_player(
        p_match_id := p_match_id,
        p_invited_by_player_id := v_inviter_player_id,
        p_invited_user_id := p_invited_user_id,
        p_expires_at := p_expires_at
    );
end;
$$;

grant execute on function public.invite_patxanga_my_player(uuid, uuid, timestamp)
to authenticated;

create or replace function public.list_patxanga_my_pending_invites()
returns jsonb
language plpgsql
stable
security definer
as
$$
begin
    return public.list_patxanga_user_pending_invites(
        public.require_patxanga_authenticated_user()
    );
end;
$$;

grant execute on function public.list_patxanga_my_pending_invites()
to authenticated;

create or replace function public.list_patxanga_my_resumable_matches()
returns jsonb
language plpgsql
stable
security definer
as
$$
begin
    return public.list_patxanga_user_resumable_matches(
        public.require_patxanga_authenticated_user()
    );
end;
$$;

grant execute on function public.list_patxanga_my_resumable_matches()
to authenticated;

create or replace function public.accept_patxanga_my_invite(
    p_invite_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
begin
    return public.accept_patxanga_invite(
        p_invite_id := p_invite_id,
        p_user_id := public.require_patxanga_authenticated_user()
    );
end;
$$;

grant execute on function public.accept_patxanga_my_invite(uuid)
to authenticated;

create or replace function public.decline_patxanga_my_invite(
    p_invite_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
begin
    return public.decline_patxanga_invite(
        p_invite_id := p_invite_id,
        p_user_id := public.require_patxanga_authenticated_user()
    );
end;
$$;

grant execute on function public.decline_patxanga_my_invite(uuid)
to authenticated;

create or replace function public.resume_patxanga_my_match(
    p_match_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
begin
    return public.resume_patxanga_match(
        p_match_id := p_match_id,
        p_user_id := public.require_patxanga_authenticated_user()
    );
end;
$$;

grant execute on function public.resume_patxanga_my_match(uuid)
to authenticated;

create or replace function public.start_patxanga_my_match_from_lobby(
    p_match_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
begin
    return public.start_patxanga_match_from_lobby(
        p_match_id := p_match_id,
        p_host_player_id := public.get_patxanga_authenticated_player_id(p_match_id)
    );
end;
$$;

grant execute on function public.start_patxanga_my_match_from_lobby(uuid)
to authenticated;

create or replace function public.get_patxanga_my_match_bootstrap(
    p_match_id uuid
)
returns jsonb
language plpgsql
stable
security definer
as
$$
begin
    return public.get_patxanga_match_bootstrap(
        p_match_id := p_match_id,
        p_user_id := public.require_patxanga_authenticated_user()
    );
end;
$$;

grant execute on function public.get_patxanga_my_match_bootstrap(uuid)
to authenticated;

create or replace function public.preview_patxanga_my_move(
    p_match_id uuid,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
stable
security definer
as
$$
begin
    return public.preview_patxanga_move(
        p_match_id := p_match_id,
        p_player_id := public.get_patxanga_authenticated_player_id(p_match_id),
        p_placed_tiles := p_placed_tiles
    );
end;
$$;

grant execute on function public.preview_patxanga_my_move(uuid, jsonb)
to authenticated;

create or replace function public.submit_patxanga_my_move(
    p_match_id uuid,
    p_placed_tiles jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
begin
    return public.submit_patxanga_move(
        p_match_id := p_match_id,
        p_player_id := public.get_patxanga_authenticated_player_id(p_match_id),
        p_placed_tiles := p_placed_tiles
    );
end;
$$;

grant execute on function public.submit_patxanga_my_move(uuid, jsonb)
to authenticated;

create or replace function public.submit_patxanga_my_pass_turn(
    p_match_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
begin
    return public.submit_patxanga_pass_turn(
        p_match_id := p_match_id,
        p_player_id := public.get_patxanga_authenticated_player_id(p_match_id)
    );
end;
$$;

grant execute on function public.submit_patxanga_my_pass_turn(uuid)
to authenticated;

create or replace function public.submit_patxanga_my_exchange_tiles(
    p_match_id uuid,
    p_tile_ids jsonb
)
returns jsonb
language plpgsql
security definer
as
$$
begin
    return public.submit_patxanga_exchange_tiles(
        p_match_id := p_match_id,
        p_player_id := public.get_patxanga_authenticated_player_id(p_match_id),
        p_tile_ids := p_tile_ids
    );
end;
$$;

grant execute on function public.submit_patxanga_my_exchange_tiles(uuid, jsonb)
to authenticated;

create or replace function public.submit_patxanga_my_vote(
    p_move_id uuid,
    p_vote_reject boolean
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_match_id uuid;
    v_voter_player_id uuid;
begin
    select match_id
    into v_match_id
    from public.patxanga_moves
    where id = p_move_id;

    if v_match_id is null then
        raise exception 'Move not found';
    end if;

    v_voter_player_id := public.get_patxanga_authenticated_player_id(v_match_id);

    return public.submit_patxanga_vote(
        p_move_id := p_move_id,
        p_voter_player_id := v_voter_player_id,
        p_vote_reject := p_vote_reject
    );
end;
$$;

grant execute on function public.submit_patxanga_my_vote(uuid, boolean)
to authenticated;

revoke all on function public.create_patxanga_my_match(
    text,
    text,
    integer,
    boolean,
    text,
    integer
) from public, anon, authenticated;
revoke all on function public.create_patxanga_my_match_lobby(
    text,
    text,
    integer,
    boolean,
    text,
    integer
) from public, anon, authenticated;
revoke all on function public.invite_patxanga_my_player(uuid, uuid, timestamp)
from public, anon, authenticated;
revoke all on function public.list_patxanga_my_pending_invites()
from public, anon, authenticated;
revoke all on function public.list_patxanga_my_resumable_matches()
from public, anon, authenticated;
revoke all on function public.accept_patxanga_my_invite(uuid)
from public, anon, authenticated;
revoke all on function public.decline_patxanga_my_invite(uuid)
from public, anon, authenticated;
revoke all on function public.resume_patxanga_my_match(uuid)
from public, anon, authenticated;
revoke all on function public.start_patxanga_my_match_from_lobby(uuid)
from public, anon, authenticated;
revoke all on function public.get_patxanga_my_match_bootstrap(uuid)
from public, anon, authenticated;
revoke all on function public.preview_patxanga_my_move(uuid, jsonb)
from public, anon, authenticated;
revoke all on function public.submit_patxanga_my_move(uuid, jsonb)
from public, anon, authenticated;
revoke all on function public.submit_patxanga_my_pass_turn(uuid)
from public, anon, authenticated;
revoke all on function public.submit_patxanga_my_exchange_tiles(uuid, jsonb)
from public, anon, authenticated;
revoke all on function public.submit_patxanga_my_vote(uuid, boolean)
from public, anon, authenticated;

grant execute on function public.create_patxanga_my_match(
    text,
    text,
    integer,
    boolean,
    text,
    integer
) to authenticated;
grant execute on function public.create_patxanga_my_match_lobby(
    text,
    text,
    integer,
    boolean,
    text,
    integer
) to authenticated;
grant execute on function public.invite_patxanga_my_player(uuid, uuid, timestamp)
to authenticated;
grant execute on function public.list_patxanga_my_pending_invites()
to authenticated;
grant execute on function public.list_patxanga_my_resumable_matches()
to authenticated;
grant execute on function public.accept_patxanga_my_invite(uuid)
to authenticated;
grant execute on function public.decline_patxanga_my_invite(uuid)
to authenticated;
grant execute on function public.resume_patxanga_my_match(uuid)
to authenticated;
grant execute on function public.start_patxanga_my_match_from_lobby(uuid)
to authenticated;
grant execute on function public.get_patxanga_my_match_bootstrap(uuid)
to authenticated;
grant execute on function public.preview_patxanga_my_move(uuid, jsonb)
to authenticated;
grant execute on function public.submit_patxanga_my_move(uuid, jsonb)
to authenticated;
grant execute on function public.submit_patxanga_my_pass_turn(uuid)
to authenticated;
grant execute on function public.submit_patxanga_my_exchange_tiles(uuid, jsonb)
to authenticated;
grant execute on function public.submit_patxanga_my_vote(uuid, boolean)
to authenticated;

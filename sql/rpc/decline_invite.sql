-- ============================================================
-- PATXANGA - RPC: decline_patxanga_invite()
-- Version: 1.0
-- Purpose: Decline direct invite
-- ============================================================

create or replace function public.decline_patxanga_invite(
    p_invite_id uuid,
    p_user_id uuid
)
returns jsonb
language plpgsql
security definer
as
$$
declare
    v_invite record;
begin
    select *
    into v_invite
    from patxanga_match_invites
    where id = p_invite_id
    for update;

    if not found then
        raise exception 'Invite not found';
    end if;

    if v_invite.invited_user_id <> p_user_id then
        raise exception 'Invite does not belong to this user';
    end if;

    if v_invite.status <> 'pending' then
        raise exception 'Invite is not pending';
    end if;

    update patxanga_match_invites
    set status = 'declined',
        responded_at = now(),
        updated_at = now()
    where id = p_invite_id;

    return jsonb_build_object(
        'invite_id', p_invite_id,
        'match_id', v_invite.match_id,
        'invite_status', 'declined'
    );
end;
$$;

grant execute on function public.decline_patxanga_invite(uuid, uuid)
to authenticated, anon;

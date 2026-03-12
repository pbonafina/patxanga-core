-- ============================================================
-- PATXANGA - RPC: validate_word()
-- Version: 1.0
-- ============================================================

create or replace function public.validate_word(
    p_word text
)
returns boolean
language plpgsql
stable
as
$$
declare
    v_normalized text;
    v_exists integer;
begin
    if p_word is null then
        return false;
    end if;

    v_normalized := public.normalize_patxanga_word(p_word);

    select 1
    into v_exists
    from patxanga_dictionary
    where word_normalized = v_normalized
    limit 1;

    return v_exists is not null;
end;
$$;

grant execute on function public.validate_word(text)
to authenticated, anon;
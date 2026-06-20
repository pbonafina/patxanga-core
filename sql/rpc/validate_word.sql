-- ============================================================
-- PATXANGA - RPC: validate_word()
-- Version: 1.0
-- ============================================================

drop function if exists public.validate_word(text);
drop function if exists public.validate_word(text, text);

create or replace function public.validate_word(
    p_word text,
    p_language text default 'pt-BR'
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

    if coalesce(nullif(trim(p_language), ''), '') = '' then
        return false;
    end if;

    v_normalized := public.normalize_patxanga_word(p_word);

    select 1
    into v_exists
    from patxanga_dictionary
    where word_normalized = v_normalized
      and language = p_language
      and is_active = true
    limit 1;

    return v_exists is not null;
end;
$$;

grant execute on function public.validate_word(text, text)
to authenticated, anon;

-- ============================================================
-- PATXANGA - RPC: normalize_patxanga_word()
-- Version: 1.0
-- ============================================================

create or replace function public.normalize_patxanga_word(
    p_word text
)
returns text
language plpgsql
immutable
as
$$
declare
    v_word text;
begin
    if p_word is null then
        return null;
    end if;

    v_word := upper(p_word);

    -- Remover acentos manualmente
    v_word := translate(
        v_word,
        'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
        'AAAAAEEEEIIIIOOOOOUUUUC'
    );

    return v_word;
end;
$$;

grant execute on function public.normalize_patxanga_word(text)
to authenticated, anon;
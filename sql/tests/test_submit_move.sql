-- ============================================================
-- PATXANGA - ENGINE INTEGRATION TEST
-- submit_patxanga_move()
-- ============================================================

-- =========================================
-- 1. Criar match
-- =========================================

select public.create_patxanga_match(
    p_host_user_id := gen_random_uuid(),
    p_language := 'PT',
    p_match_mode := 'synchronous',
    p_max_players := 2
) as match_created;

-- Copie o match_id retornado manualmente abaixo
-- e substitua nos blocos seguintes

-- =========================================
-- 2. Inserir jogadores
-- =========================================

-- Substituir MATCH_ID abaixo
-- Substituir USER_ID_1 e USER_ID_2 manualmente

insert into patxanga_players (
    id,
    match_id,
    user_id,
    score,
    rack_state,
    turn_order,
    created_at
)
values
(gen_random_uuid(), 'MATCH_ID', 'USER_ID_1', 0, '[]'::jsonb, 1, now()),
(gen_random_uuid(), 'MATCH_ID', 'USER_ID_2', 0, '[]'::jsonb, 2, now());

-- =========================================
-- 3. Iniciar partida
-- =========================================

select public.start_patxanga_match('MATCH_ID');

-- =========================================
-- 4. Ver rack do jogador 1
-- =========================================

select rack_state
from patxanga_players
where match_id = 'MATCH_ID'
  and user_id = 'USER_ID_1';

-- Escolha manualmente uma letra do rack
-- e monte a jogada abaixo

-- =========================================
-- 5. Simular jogada no centro (8,8)
-- =========================================

select public.submit_patxanga_move(
    'MATCH_ID',
    'USER_ID_1',
    '[
        {
            "tile_id": "UUID_DA_PECA_ESCOLHIDA",
            "row": 8,
            "col": 8,
            "declared_letter": null
        }
    ]'::jsonb
);

-- =========================================
-- 6. Verificar estado final
-- =========================================

-- Board
select board_state
from patxanga_matches
where id = 'MATCH_ID';

-- Rack atualizado
select rack_state
from patxanga_players
where match_id = 'MATCH_ID'
  and user_id = 'USER_ID_1';

-- Bag atualizada
select bag_state
from patxanga_matches
where id = 'MATCH_ID';

-- Replay
select *
from patxanga_replay_events
where match_id = 'MATCH_ID'
order by created_at;
-- ============================================================
-- PATXANGA - LETTER DISTRIBUTION SEED
-- Version: 1.0
-- ============================================================

-- ============================================================
-- TABLE: patxanga_letter_distribution
-- ============================================================

create table if not exists patxanga_letter_distribution (
    id bigserial primary key,

    language text not null check (language in ('pt-BR','pt-PT')),
    letter text not null,
    quantity integer not null,
    points integer not null,

    is_special boolean not null default false,
    special_type text null check (
        special_type in ('wildcard','skip_turn','patxanga_real')
    ),

    created_at timestamp not null default now(),

    unique(language, letter, special_type)
);

-- ============================================================
-- CLEAR EXISTING DATA (SAFE FOR DEV)
-- ============================================================

delete from patxanga_letter_distribution
where language in ('pt-BR','pt-PT');

-- ============================================================
-- INSERT DISTRIBUTION - PATXANGA v1.0
-- ============================================================

-- =============================
-- VOGAIS
-- =============================

insert into patxanga_letter_distribution (language, letter, quantity, points)
values
('pt-BR','A',14,1),
('pt-BR','E',11,1),
('pt-BR','O',9,1),
('pt-BR','I',7,1),
('pt-BR','U',5,2);

-- =============================
-- CONSOANTES FREQUENTES
-- =============================

insert into patxanga_letter_distribution (language, letter, quantity, points)
values
('pt-BR','S',7,1),
('pt-BR','R',6,1),
('pt-BR','N',5,1),
('pt-BR','D',4,2),
('pt-BR','M',4,2),
('pt-BR','T',4,2),
('pt-BR','C',4,2);

-- =============================
-- CONSOANTES INTERMEDIÁRIAS
-- =============================

insert into patxanga_letter_distribution (language, letter, quantity, points)
values
('pt-BR','L',3,2),
('pt-BR','P',2,3),
('pt-BR','B',2,3),
('pt-BR','G',2,3),
('pt-BR','V',2,3),
('pt-BR','F',1,4),
('pt-BR','H',1,4),
('pt-BR','J',1,5);

-- =============================
-- LETRAS ESTRATÉGICAS
-- =============================

insert into patxanga_letter_distribution (language, letter, quantity, points)
values
('pt-BR','Q',2,6),
('pt-BR','X',2,6),
('pt-BR','Z',2,7),
('pt-BR','K',1,7),
('pt-BR','Y',1,7),
('pt-BR','W',1,7);

-- =============================
-- PEÇAS ESPECIAIS
-- Todas são wildcard
-- =============================

insert into patxanga_letter_distribution
(language, letter, quantity, points, is_special, special_type)
values
('pt-BR','*',2,0,true,'wildcard'),          -- Coringas
('pt-BR','SKIP',4,0,true,'skip_turn'),     -- Pular turno
('pt-BR','PR',1,0,true,'patxanga_real');   -- Patxanga Real

-- ============================================================
-- END OF SEED
-- ============================================================
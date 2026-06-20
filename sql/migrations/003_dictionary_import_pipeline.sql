-- ============================================================
-- PATXANGA - Migration 003
-- Dictionary Import Pipeline
-- Version: 1.0
-- ============================================================

create table if not exists public.patxanga_dictionary_import_batches (
    id uuid primary key default uuid_generate_v4(),
    language text not null check (language in ('pt-BR', 'pt-PT')),
    source text not null check (length(trim(source)) > 0),
    source_version text null,
    license_name text not null check (length(trim(license_name)) > 0),
    license_url text null,
    source_url text null,
    imported_by text null,
    import_status text not null default 'completed'
        check (import_status in ('completed', 'failed')),
    total_rows integer not null default 0 check (total_rows >= 0),
    valid_rows integer not null default 0 check (valid_rows >= 0),
    inserted_count integer not null default 0 check (inserted_count >= 0),
    updated_count integer not null default 0 check (updated_count >= 0),
    skipped_count integer not null default 0 check (skipped_count >= 0),
    deactivated_count integer not null default 0 check (deactivated_count >= 0),
    metadata jsonb not null default '{}'::jsonb,
    notes text null,
    created_at timestamptz not null default now(),
    completed_at timestamptz not null default now()
);

alter table public.patxanga_dictionary
add column if not exists source_version text,
add column if not exists license_name text,
add column if not exists license_url text,
add column if not exists source_url text,
add column if not exists import_batch_id uuid,
add column if not exists imported_at timestamptz;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'patxanga_dictionary_import_batch_fk'
          and conrelid = 'public.patxanga_dictionary'::regclass
    ) then
        alter table public.patxanga_dictionary
        add constraint patxanga_dictionary_import_batch_fk
        foreign key (import_batch_id)
        references public.patxanga_dictionary_import_batches(id)
        on delete set null;
    end if;
end $$;

create index if not exists idx_patxanga_dictionary_import_batch
on public.patxanga_dictionary (import_batch_id);

create index if not exists idx_patxanga_dictionary_language_source_active
on public.patxanga_dictionary (language, source, is_active);

create index if not exists idx_patxanga_dictionary_import_batches_source
on public.patxanga_dictionary_import_batches (language, source, source_version);

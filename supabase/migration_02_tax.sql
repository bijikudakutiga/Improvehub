-- ============================================================
-- MIGRASI 02 — Modul Perpajakan (jalankan setelah schema.sql)
-- Supabase Dashboard > SQL Editor > New query > tempel semua ini > Run
-- ============================================================

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  full_name text not null,
  npwp text,
  ptkp_status text not null default 'TK/0' check (ptkp_status in ('TK/0','TK/1','TK/2','TK/3','K/0','K/1','K/2','K/3')),
  gross_salary numeric(18,2) not null default 0,
  is_permanent boolean default true,
  created_at timestamptz default now()
);

create table if not exists tax_filings (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  tax_type text not null check (tax_type in ('pph21','pph23','pph26','ppn','pph25','pph_badan')),
  period_month integer not null,
  period_year integer not null,
  taxable_amount numeric(18,2) default 0,
  tax_amount numeric(18,2) not null,
  status text not null default 'belum_bayar' check (status in ('belum_bayar','sudah_bayar','sudah_lapor')),
  notes text,
  created_at timestamptz default now()
);

alter table employees enable row level security;
alter table tax_filings enable row level security;

create policy "employees_access" on employees for all using (
  exists (select 1 from user_profiles up where up.id = auth.uid() and (up.role = 'owner' or employees.entity_id = any(up.entity_access)))
);
create policy "tax_filings_access" on tax_filings for all using (
  exists (select 1 from user_profiles up where up.id = auth.uid() and (up.role = 'owner' or tax_filings.entity_id = any(up.entity_access)))
);

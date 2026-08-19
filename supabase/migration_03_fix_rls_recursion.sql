-- ============================================================
-- MIGRASI 03 — Perbaikan "infinite recursion" pada RLS user_profiles
-- (versi aman — tidak error walau migration_02_tax.sql belum dijalankan)
-- Jalankan di: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

create or replace function fn_is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role = 'owner' from user_profiles where id = auth.uid()), false);
$$;

create or replace function fn_user_entity_access()
returns uuid[]
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select entity_access from user_profiles where id = auth.uid()), '{}');
$$;

drop policy if exists "user_profiles_self" on user_profiles;
drop policy if exists "user_profiles_select" on user_profiles;
create policy "user_profiles_select" on user_profiles for select using (
  auth.uid() = id or fn_is_owner()
);
drop policy if exists "user_profiles_update" on user_profiles;
create policy "user_profiles_update" on user_profiles for update using (
  auth.uid() = id or fn_is_owner()
);

drop policy if exists "transactions_access" on transactions;
create policy "transactions_access" on transactions for all using (
  fn_is_owner() or entity_id = any(fn_user_entity_access())
);

drop policy if exists "journal_lines_read" on journal_lines;
create policy "journal_lines_read" on journal_lines for select using (
  fn_is_owner() or entity_id = any(fn_user_entity_access())
);

-- Bagian ini dilewati otomatis kalau migration_02_tax.sql belum pernah dijalankan
do $$
begin
  if to_regclass('public.employees') is not null then
    execute 'drop policy if exists "employees_access" on employees';
    execute 'create policy "employees_access" on employees for all using (fn_is_owner() or entity_id = any(fn_user_entity_access()))';
  end if;

  if to_regclass('public.tax_filings') is not null then
    execute 'drop policy if exists "tax_filings_access" on tax_filings';
    execute 'create policy "tax_filings_access" on tax_filings for all using (fn_is_owner() or entity_id = any(fn_user_entity_access()))';
  end if;
end $$;

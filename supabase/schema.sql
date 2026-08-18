-- ============================================================
-- IMPROVEHUB Finance & Tax App — Database Schema (Supabase/Postgres)
-- Jalankan file ini di: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

-- 1. ENTITAS (3 PT di bawah IMPROVEHUB)
create table if not exists entities (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,             -- 'SPK', 'FYI', 'IGL'
  legal_name text not null,              -- 'PT. Sumber Pengembangan Karya'
  npwp text default '00.000.000.0-000.000',  -- placeholder, bisa diedit di web
  address text default 'Jl. Singosari I No.27, Pleburan, Kec. Semarang Sel., Kota Semarang, Jawa Tengah 50241',
  logo_url text,
  created_at timestamptz default now()
);

insert into entities (code, legal_name) values
  ('SPK', 'PT. Sumber Pengembangan Karya'),
  ('FYI', 'PT. FYI Psychology Indonesia'),
  ('IGL', 'I-Global')
on conflict (code) do nothing;

-- 2. CHART OF ACCOUNTS (akun akuntansi standar, dipetakan otomatis dari kategori)
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  code text not null,                    -- '1-1001'
  name text not null,                    -- 'Kas Kecil'
  type text not null check (type in ('aset','kewajiban','ekuitas','pendapatan','beban')),
  subtype text,                          -- 'kas_setara_kas', 'piutang_usaha', 'aset_tetap', dst
  entity_id uuid references entities(id) on delete cascade,
  is_related_party boolean default false,
  created_at timestamptz default now()
);

-- 3. KATEGORI TRANSAKSI (yang dilihat & dipilih user — dipetakan ke akun)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- 'Penjualan Jasa', 'Gaji Karyawan', 'Bank BCA'
  kind text not null check (kind in ('pemasukan','pengeluaran')),
  account_id uuid references accounts(id),
  entity_id uuid references entities(id) on delete cascade,
  icon text,
  created_at timestamptz default now()
);

-- 4. TRANSAKSI (header)
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  category_id uuid references categories(id),
  kind text not null check (kind in ('pemasukan','pengeluaran')),
  amount numeric(18,2) not null check (amount > 0),
  trx_date date not null default current_date,
  description text,
  counterparty text,                     -- nama pihak (untuk piutang/utang usaha)
  is_related_party boolean default false,
  attachment_url text,                   -- bukti nota (Supabase Storage)
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 5. JURNAL / DOUBLE-ENTRY LINES (dibentuk otomatis oleh trigger di bawah)
create table if not exists journal_lines (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  account_id uuid references accounts(id),
  entity_id uuid references entities(id),
  debit numeric(18,2) default 0,
  credit numeric(18,2) default 0,
  trx_date date not null,
  created_at timestamptz default now()
);

-- 6. ASET TETAP
create table if not exists fixed_assets (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  name text not null,
  category text,                          -- 'Kendaraan','Peralatan Kantor', dst
  acquisition_date date not null,
  acquisition_cost numeric(18,2) not null,
  useful_life_years integer not null default 4,
  salvage_value numeric(18,2) default 0,
  created_at timestamptz default now()
);

-- 7. ANGGARAN
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  category_id uuid references categories(id),
  period_month integer not null,          -- 1-12
  period_year integer not null,
  planned_amount numeric(18,2) not null,
  created_at timestamptz default now()
);

-- 8. PROFIL PENGGUNA & ROLE (owner / admin_keuangan / viewer)
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('owner','admin_keuangan','viewer')),
  entity_access uuid[] default '{}',      -- daftar entity_id yang boleh diakses; kosong = akses semua (owner)
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — isolasi data per PT
-- ============================================================
alter table transactions enable row level security;
alter table journal_lines enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table fixed_assets enable row level security;
alter table budgets enable row level security;
alter table entities enable row level security;
alter table user_profiles enable row level security;

-- Semua user yang login boleh baca daftar entitas
create policy "entities_read_all" on entities for select using (auth.role() = 'authenticated');

-- Baca/tulis transaksi hanya jika role owner ATAU entity ada di entity_access user
create policy "transactions_access" on transactions for all using (
  exists (
    select 1 from user_profiles up
    where up.id = auth.uid()
    and (up.role = 'owner' or transactions.entity_id = any(up.entity_access))
  )
);

create policy "journal_lines_read" on journal_lines for select using (
  exists (
    select 1 from user_profiles up
    where up.id = auth.uid()
    and (up.role = 'owner' or journal_lines.entity_id = any(up.entity_access))
  )
);

create policy "accounts_access" on accounts for all using (auth.role() = 'authenticated');
create policy "categories_access" on categories for all using (auth.role() = 'authenticated');
create policy "fixed_assets_access" on fixed_assets for all using (auth.role() = 'authenticated');
create policy "budgets_access" on budgets for all using (auth.role() = 'authenticated');
create policy "user_profiles_self" on user_profiles for select using (auth.uid() = id or exists (
  select 1 from user_profiles up where up.id = auth.uid() and up.role = 'owner'
));

-- ============================================================
-- TRIGGER: setiap kali transaksi baru dibuat, otomatis buat 2 baris jurnal
-- (debit ke akun kas/bank, kredit ke akun pendapatan — atau sebaliknya untuk pengeluaran)
-- Ini yang membuat user tidak perlu paham "debit/kredit" sama sekali.
-- ============================================================
create or replace function fn_create_journal_lines()
returns trigger as $$
declare
  v_cash_account uuid;
  v_category_account uuid;
begin
  select account_id into v_category_account from categories where id = new.category_id;

  -- akun kas/bank default per entitas (akun pertama bertipe aset, subtype kas_setara_kas)
  select id into v_cash_account from accounts
    where entity_id = new.entity_id and subtype = 'kas_setara_kas' limit 1;

  if new.kind = 'pemasukan' then
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_cash_account, new.entity_id, new.amount, 0, new.trx_date);
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_category_account, new.entity_id, 0, new.amount, new.trx_date);
  else
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_category_account, new.entity_id, new.amount, 0, new.trx_date);
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_cash_account, new.entity_id, 0, new.amount, new.trx_date);
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_create_journal_lines on transactions;
create trigger trg_create_journal_lines
  after insert on transactions
  for each row execute function fn_create_journal_lines();

-- ============================================================
-- SEED: akun dasar untuk masing-masing dari 3 PT
-- ============================================================
do $$
declare e record;
begin
  for e in select id from entities loop
    insert into accounts (code, name, type, subtype, entity_id) values
      ('1-1001', 'Kas Kecil', 'aset', 'kas_setara_kas', e.id),
      ('1-1002', 'Bank BCA', 'aset', 'kas_setara_kas', e.id),
      ('1-1101', 'Piutang Usaha - Pihak Ketiga', 'aset', 'piutang_usaha', e.id),
      ('1-1102', 'Piutang Usaha - Pihak Berelasi', 'aset', 'piutang_usaha', e.id),
      ('1-2001', 'Aset Tetap', 'aset', 'aset_tetap', e.id),
      ('2-1001', 'Utang Usaha - Pihak Ketiga', 'kewajiban', 'utang_usaha', e.id),
      ('2-1002', 'Utang Usaha - Pihak Berelasi', 'kewajiban', 'utang_usaha', e.id),
      ('2-2001', 'Utang PPh 21', 'kewajiban', 'utang_pajak', e.id),
      ('2-2002', 'Utang PPh 23', 'kewajiban', 'utang_pajak', e.id),
      ('2-2003', 'Utang PPN', 'kewajiban', 'utang_pajak', e.id),
      ('2-2004', 'Utang PPh 25', 'kewajiban', 'utang_pajak', e.id),
      ('3-1001', 'Modal Disetor', 'ekuitas', null, e.id),
      ('3-2001', 'Laba Ditahan', 'ekuitas', null, e.id),
      ('4-1001', 'Pendapatan Jasa', 'pendapatan', null, e.id),
      ('4-1002', 'Pendapatan Lain-lain', 'pendapatan', null, e.id),
      ('5-1001', 'Beban Gaji', 'beban', null, e.id),
      ('5-1002', 'Beban Operasional', 'beban', null, e.id),
      ('5-1003', 'Beban Sewa', 'beban', null, e.id),
      ('5-1004', 'Beban Penyusutan', 'beban', null, e.id);
  end loop;
end $$;

-- Kategori default (contoh awal — bisa ditambah/ubah lewat menu Pengaturan)
do $$
declare e record; acc_pendapatan uuid; acc_gaji uuid; acc_operasional uuid;
begin
  for e in select id from entities loop
    select id into acc_pendapatan from accounts where entity_id = e.id and code = '4-1001';
    select id into acc_gaji from accounts where entity_id = e.id and code = '5-1001';
    select id into acc_operasional from accounts where entity_id = e.id and code = '5-1002';

    insert into categories (name, kind, account_id, entity_id) values
      ('Pendapatan Jasa', 'pemasukan', acc_pendapatan, e.id),
      ('Gaji Karyawan', 'pengeluaran', acc_gaji, e.id),
      ('Operasional Kantor', 'pengeluaran', acc_operasional, e.id);
  end loop;
end $$;

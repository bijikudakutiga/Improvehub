-- ============================================================
-- MIGRASI 05 — Piutang/Utang, Pelunasan, Modal Disetor, Kewajiban Pajak ke Neraca
-- Jalankan di: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

-- 1. Kolom status pembayaran pada transaksi
alter table transactions add column if not exists payment_status text not null default 'lunas' check (payment_status in ('lunas','belum_lunas'));
alter table transactions add column if not exists due_date date;
alter table transactions add column if not exists paid_date date;
alter table transactions add column if not exists payment_method text;

-- 2. Tambahkan akun "Beban Pajak" untuk tiap entitas yang belum punya (dipakai saat kewajiban pajak dicatat)
do $$
declare e record;
begin
  for e in select id from entities loop
    if not exists (select 1 from accounts where entity_id = e.id and code = '5-1005') then
      insert into accounts (code, name, type, subtype, entity_id) values ('5-1005', 'Beban Pajak', 'beban', null, e.id);
    end if;
  end loop;
end $$;

-- 3. INSERT trigger — pilih akun Kas ATAU Piutang/Utang tergantung status pembayaran
create or replace function fn_create_journal_lines()
returns trigger as $$
declare
  v_settle_account uuid;
  v_category_account uuid;
begin
  select account_id into v_category_account from categories where id = new.category_id;

  if new.payment_status = 'belum_lunas' then
    if new.kind = 'pemasukan' then
      select id into v_settle_account from accounts where entity_id = new.entity_id and code = '1-1101' limit 1; -- Piutang Usaha
    else
      select id into v_settle_account from accounts where entity_id = new.entity_id and code = '2-1001' limit 1; -- Utang Usaha
    end if;
  else
    select id into v_settle_account from accounts where entity_id = new.entity_id and subtype = 'kas_setara_kas' limit 1;
  end if;

  if new.kind = 'pemasukan' then
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_settle_account, new.entity_id, new.amount, 0, new.trx_date);
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_category_account, new.entity_id, 0, new.amount, new.trx_date);
  else
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_category_account, new.entity_id, new.amount, 0, new.trx_date);
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_settle_account, new.entity_id, 0, new.amount, new.trx_date);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 4. UPDATE trigger — dua mode: (a) pelunasan (pindahkan Piutang/Utang -> Kas, tanggal = tanggal bayar),
--    (b) edit biasa (hapus & buat ulang jurnal sesuai status pembayaran saat ini)
create or replace function fn_resync_journal_lines()
returns trigger as $$
declare
  v_settle_account uuid;
  v_category_account uuid;
begin
  if new.payment_status = 'lunas' and old.payment_status = 'belum_lunas' then
    select id into v_settle_account from accounts where entity_id = new.entity_id and subtype = 'kas_setara_kas' limit 1;
    update journal_lines
      set account_id = v_settle_account, trx_date = coalesce(new.paid_date, new.trx_date)
      where transaction_id = new.id
        and account_id in (select id from accounts where entity_id = new.entity_id and code in ('1-1101','2-1001'));
    return new;
  end if;

  delete from journal_lines where transaction_id = new.id;
  select account_id into v_category_account from categories where id = new.category_id;

  if new.payment_status = 'belum_lunas' then
    if new.kind = 'pemasukan' then
      select id into v_settle_account from accounts where entity_id = new.entity_id and code = '1-1101' limit 1;
    else
      select id into v_settle_account from accounts where entity_id = new.entity_id and code = '2-1001' limit 1;
    end if;
  else
    select id into v_settle_account from accounts where entity_id = new.entity_id and subtype = 'kas_setara_kas' limit 1;
  end if;

  if new.kind = 'pemasukan' then
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_settle_account, new.entity_id, new.amount, 0, new.trx_date);
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_category_account, new.entity_id, 0, new.amount, new.trx_date);
  else
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_category_account, new.entity_id, new.amount, 0, new.trx_date);
    insert into journal_lines (transaction_id, account_id, entity_id, debit, credit, trx_date)
    values (new.id, v_settle_account, new.entity_id, 0, new.amount, new.trx_date);
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_create_journal_lines on transactions;
create trigger trg_create_journal_lines after insert on transactions for each row execute function fn_create_journal_lines();

drop trigger if exists trg_resync_journal_lines on transactions;
create trigger trg_resync_journal_lines after update on transactions for each row execute function fn_resync_journal_lines();

-- 5. Fungsi untuk mencatat Modal Disetor / Utang Lain-lain (dipanggil dari menu Pengaturan)
create or replace function fn_add_capital_entry(p_entity_id uuid, p_entry_type text, p_amount numeric, p_entry_date date, p_description text default null)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_kas_account uuid;
  v_other_account uuid;
begin
  select id into v_kas_account from accounts where entity_id = p_entity_id and subtype = 'kas_setara_kas' limit 1;
  if p_entry_type = 'modal_disetor' then
    select id into v_other_account from accounts where entity_id = p_entity_id and code = '3-1001' limit 1;
  else
    select id into v_other_account from accounts where entity_id = p_entity_id and code = '2-1001' limit 1;
  end if;
  if v_kas_account is null or v_other_account is null or p_amount <= 0 then return; end if;
  insert into journal_lines (account_id, entity_id, debit, credit, trx_date) values
    (v_kas_account, p_entity_id, p_amount, 0, p_entry_date),
    (v_other_account, p_entity_id, 0, p_amount, p_entry_date);
end;
$$;
grant execute on function fn_add_capital_entry to authenticated;

-- 6. Fungsi untuk mencatat kewajiban pajak ke Neraca (dipanggil dari modul Pajak)
create or replace function fn_record_tax_liability(p_entity_id uuid, p_tax_type text, p_amount numeric, p_entry_date date)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_liability_code text;
  v_expense_account uuid;
  v_liability_account uuid;
begin
  v_liability_code := case p_tax_type
    when 'pph21' then '2-2001' when 'pph23' then '2-2002' when 'pph26' then '2-2002'
    when 'ppn' then '2-2003' when 'pph25' then '2-2004' when 'pph_badan' then '2-2004'
    else '2-2001' end;
  select id into v_expense_account from accounts where entity_id = p_entity_id and code = '5-1005' limit 1;
  select id into v_liability_account from accounts where entity_id = p_entity_id and code = v_liability_code limit 1;
  if v_expense_account is null or v_liability_account is null or p_amount <= 0 then return; end if;
  insert into journal_lines (account_id, entity_id, debit, credit, trx_date) values
    (v_expense_account, p_entity_id, p_amount, 0, p_entry_date),
    (v_liability_account, p_entity_id, 0, p_amount, p_entry_date);
end;
$$;
grant execute on function fn_record_tax_liability to authenticated;

-- 7. Perbaiki kategori LAMA yang belum punya pemetaan akun (dibuat sebelum perbaikan ini)
-- supaya transaksi yang memakainya langsung ikut muncul di semua laporan.
update categories c
set account_id = (
  select a.id from accounts a
  where a.entity_id = c.entity_id
    and a.code = case when c.kind = 'pemasukan' then '4-1002' else '5-1002' end
  limit 1
)
where c.account_id is null;

-- 8. Perbaiki baris JURNAL lama yang sudah terlanjur tersimpan tanpa akun
-- (transaksi yang dibuat sebelum kategori terkait diperbaiki di atas)
update journal_lines jl
set account_id = (
  select c.account_id from transactions t
  join categories c on c.id = t.category_id
  where t.id = jl.transaction_id
)
where jl.account_id is null
  and jl.transaction_id is not null
  and exists (
    select 1 from transactions t join categories c on c.id = t.category_id
    where t.id = jl.transaction_id and c.account_id is not null
  );



-- ============================================================
-- MIGRASI 04 — Sinkronisasi jurnal otomatis saat transaksi diedit
-- Jalankan di: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

create or replace function fn_resync_journal_lines()
returns trigger as $$
declare
  v_cash_account uuid;
  v_category_account uuid;
begin
  delete from journal_lines where transaction_id = new.id;

  select account_id into v_category_account from categories where id = new.category_id;
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

drop trigger if exists trg_resync_journal_lines on transactions;
create trigger trg_resync_journal_lines
  after update on transactions
  for each row execute function fn_resync_journal_lines();

-- Catatan: penghapusan transaksi TIDAK butuh migrasi tambahan — baris jurnalnya
-- otomatis ikut terhapus karena relasinya sudah "on delete cascade" sejak awal.

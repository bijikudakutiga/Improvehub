import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

function PaymentModal({ trx, onClose, onSaved }) {
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState('Transfer Bank')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    setSaving(true)
    setError('')
    const { error } = await supabase.from('transactions').update({
      payment_status: 'lunas', paid_date: paidDate, payment_method: method
    }).eq('id', trx.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-ink-900/45 p-4 sm:items-center">
      <div className="animate-fadeIn w-full max-w-sm rounded-xl2 border border-lavender-200 bg-white p-6 shadow-2xl">
        <p className="font-display mb-1 text-sm font-semibold text-ink-900">Konfirmasi Pembayaran</p>
        <p className="mb-4 text-xs text-ink-400">{trx.description || (trx.kind === 'pemasukan' ? 'Piutang' : 'Utang')} — Rp {Number(trx.amount).toLocaleString('id-ID')}</p>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Tanggal Pembayaran</label>
            <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Pembayaran via</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm">
              <option>Transfer Bank</option>
              <option>Tunai</option>
              <option>QRIS</option>
              <option>Lainnya</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">⚠ {error}</p>}

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-lavender-200 py-2.5 text-sm text-ink-400 hover:bg-lavender-50">Batal</button>
          <button onClick={confirm} disabled={saving} className="flex-1 rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Konfirmasi Lunas'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TransactionList() {
  const { activeEntityId } = useEntity()
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('semua')
  const [deletingId, setDeletingId] = useState(null)
  const [payingTrx, setPayingTrx] = useState(null)

  const load = () => {
    let query = supabase.from('transactions').select('*, categories(name)').order('trx_date', { ascending: false }).limit(100)
    if (activeEntityId) query = query.eq('entity_id', activeEntityId)
    query.then(({ data }) => setRows(data || []))
  }
  useEffect(load, [activeEntityId])

  const remove = async id => {
    if (!confirm('Hapus transaksi ini? Jurnal akuntansinya juga ikut terhapus. Tindakan ini tidak bisa dibatalkan.')) return
    setDeletingId(id)
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    setDeletingId(null)
    if (error) { alert('Gagal menghapus: ' + error.message); return }
    load()
  }

  const filtered = rows.filter(r => filter === 'semua' || r.kind === filter)

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <SectionEyebrow>Semua Transaksi</SectionEyebrow>
        <Link to="/transaksi/tambah" className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90">+ Tambah Transaksi</Link>
      </div>

      <div className="mb-4 flex gap-2">
        {['semua', 'pemasukan', 'pengeluaran'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-ink-900 text-white' : 'bg-lavender-50 text-ink-400 hover:bg-lavender-100'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl2 border border-lavender-200 bg-white">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3 font-medium">Tanggal</th>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium">Keterangan</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Jumlah</th>
              <th className="px-5 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-ink-400">Belum ada transaksi.</td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-lavender-50 last:border-0 hover:bg-lavender-50/50">
                <td className="px-5 py-3 text-ink-400">{t.trx_date}</td>
                <td className="px-5 py-3 text-ink-900">{t.categories?.name || '—'}</td>
                <td className="px-5 py-3 text-ink-400">{t.description || '—'}</td>
                <td className="px-5 py-3">
                  {t.payment_status === 'belum_lunas' ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">Belum Lunas{t.due_date ? ` · JT ${t.due_date}` : ''}</span>
                  ) : (
                    <span className="rounded-full bg-mint/50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Lunas</span>
                  )}
                </td>
                <td className={`font-mono px-5 py-3 text-right font-medium ${t.kind === 'pemasukan' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {t.kind === 'pemasukan' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {t.payment_status === 'belum_lunas' && (
                      <button onClick={() => setPayingTrx(t)} className="rounded-lg border border-emerald-200 px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50">Update Pembayaran</button>
                    )}
                    <Link to={`/transaksi/edit/${t.id}`} className="rounded-lg border border-lavender-200 px-2.5 py-1 text-xs text-ink-900 hover:bg-lavender-50">Edit</Link>
                    <button onClick={() => remove(t.id)} disabled={deletingId === t.id} className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50 disabled:opacity-50">
                      {deletingId === t.id ? '...' : 'Hapus'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payingTrx && (
        <PaymentModal trx={payingTrx} onClose={() => setPayingTrx(null)} onSaved={() => { setPayingTrx(null); load() }} />
      )}
    </div>
  )
}

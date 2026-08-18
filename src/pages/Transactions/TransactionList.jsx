import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

export default function TransactionList() {
  const { activeEntityId } = useEntity()
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('semua')

  useEffect(() => {
    let query = supabase.from('transactions').select('*, categories(name)').order('trx_date', { ascending: false }).limit(100)
    if (activeEntityId) query = query.eq('entity_id', activeEntityId)
    query.then(({ data }) => setRows(data || []))
  }, [activeEntityId])

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

      <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3 font-medium">Tanggal</th>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium">Keterangan</th>
              <th className="px-5 py-3 text-right font-medium">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-ink-400">Belum ada transaksi.</td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-lavender-50 last:border-0 hover:bg-lavender-50/50">
                <td className="px-5 py-3 text-ink-400">{t.trx_date}</td>
                <td className="px-5 py-3 text-ink-900">{t.categories?.name || '—'}</td>
                <td className="px-5 py-3 text-ink-400">{t.description || '—'}</td>
                <td className={`font-mono px-5 py-3 text-right font-medium ${t.kind === 'pemasukan' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {t.kind === 'pemasukan' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, ExportBar } from '../../components/ui.jsx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function Consolidated() {
  const { entities } = useEntity()
  const [rows, setRows] = useState([])

  useEffect(() => {
    async function load() {
      const results = []
      for (const e of entities) {
        const { data } = await supabase.from('transactions').select('kind, amount').eq('entity_id', e.id)
        const income = data?.filter(t => t.kind === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0) || 0
        const expense = data?.filter(t => t.kind === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0) || 0
        results.push({ name: e.legal_name, code: e.code, pemasukan: income, pengeluaran: expense, laba: income - expense })
      }
      setRows(results)
    }
    if (entities.length) load()
  }, [entities])

  const totalIncome = rows.reduce((s, r) => s + r.pemasukan, 0)
  const totalExpense = rows.reduce((s, r) => s + r.pengeluaran, 0)

  return (
    <div>
      <SectionEyebrow>Laporan Konsolidasi — IMPROVEHUB Group</SectionEyebrow>
      <p className="mb-4 text-xs text-ink-400">
        Menjumlahkan hasil 3 PT tanpa eliminasi transaksi antar-entitas. Untuk laporan konsolidasi
        formal (dengan eliminasi saldo pihak berelasi), gunakan bantuan akuntan Anda sebelum pelaporan resmi.
      </p>

      {rows.length > 0 && (
        <ExportBar filename="konsolidasi-improvehub" rows={rows} columns={[
          { label: 'PT', key: 'name' }, { label: 'Pemasukan', key: 'pemasukan' }, { label: 'Pengeluaran', key: 'pengeluaran' }, { label: 'Laba', key: 'laba' }
        ]} />
      )}

      <div className="rounded-xl2 border border-lavender-200 bg-white p-4 sm:p-5">
        {rows.length === 0 ? <p className="py-16 text-center text-sm text-ink-400">Memuat data...</p> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEAF9" />
              <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#5C4A87' }} />
              <YAxis tick={{ fontSize: 10, fill: '#5C4A87' }} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="pemasukan" fill="#7EAE8F" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pengeluaran" fill="#D98AA0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl2 bg-mint/40 p-4"><p className="text-xs text-ink-400">Total Pemasukan Group</p><p className="font-mono text-lg font-semibold text-ink-900">{fmt(totalIncome)}</p></div>
        <div className="rounded-xl2 bg-blush/40 p-4"><p className="text-xs text-ink-400">Total Pengeluaran Group</p><p className="font-mono text-lg font-semibold text-ink-900">{fmt(totalExpense)}</p></div>
        <div className="rounded-xl2 bg-lavender-100 p-4"><p className="text-xs text-ink-400">Laba Bersih Group</p><p className="font-mono text-lg font-semibold text-ink-900">{fmt(totalIncome - totalExpense)}</p></div>
      </div>
    </div>
  )
}

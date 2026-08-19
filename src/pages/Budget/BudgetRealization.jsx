import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export default function BudgetRealization() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const now = new Date()
  const [period] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!entityId) return
    async function load() {
      const { data: budgets } = await supabase.from('budgets').select('*, categories(name)').eq('entity_id', entityId).eq('period_month', period.month).eq('period_year', period.year)
      const start = `${period.year}-${String(period.month).padStart(2, '0')}-01`
      const end = new Date(period.year, period.month, 0).toISOString().slice(0, 10)
      const { data: trx } = await supabase.from('transactions').select('category_id, amount').eq('entity_id', entityId).eq('kind', 'pengeluaran').gte('trx_date', start).lte('trx_date', end)

      const realizedByCategory = {}
      trx?.forEach(t => { realizedByCategory[t.category_id] = (realizedByCategory[t.category_id] || 0) + Number(t.amount) })

      setRows((budgets || []).map(b => ({
        name: b.categories?.name || '—',
        anggaran: Number(b.planned_amount),
        realisasi: realizedByCategory[b.category_id] || 0
      })))
    }
    load()
  }, [entityId, period])

  return (
    <div>
      <SectionEyebrow>Realisasi vs Anggaran — {MONTHS[period.month - 1]} {period.year}</SectionEyebrow>
      {!activeEntityId && <p className="mb-4 text-xs text-ink-400">Menampilkan PT pertama — pilih PT tertentu untuk melihat realisasi masing-masing.</p>}

      <div className="rounded-xl2 border border-lavender-200 bg-white p-4 sm:p-5">
        {rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-400">Belum ada anggaran untuk bulan ini. Atur dulu di menu Anggaran per Kategori.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEAF9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5C4A87' }} />
              <YAxis tick={{ fontSize: 10, fill: '#5C4A87' }} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="anggaran" fill="#9B87C4" radius={[6, 6, 0, 0]} />
              <Bar dataKey="realisasi" fill="#D98AA0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {rows.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl2 border border-lavender-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 text-right font-medium">Anggaran</th>
                <th className="px-4 py-3 text-right font-medium">Realisasi</th>
                <th className="px-4 py-3 text-right font-medium">Sisa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-lavender-50 last:border-0">
                  <td className="px-4 py-3 text-ink-900">{r.name}</td>
                  <td className="font-mono px-4 py-3 text-right text-ink-400">{fmt(r.anggaran)}</td>
                  <td className="font-mono px-4 py-3 text-right text-ink-400">{fmt(r.realisasi)}</td>
                  <td className={`font-mono px-4 py-3 text-right font-medium ${r.anggaran - r.realisasi < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{fmt(r.anggaran - r.realisasi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

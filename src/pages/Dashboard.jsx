import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useEntity } from '../contexts/EntityContext.jsx'
import { KpiCard, SectionEyebrow, ActionCard } from '../components/ui.jsx'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const { activeEntityId, activeEntity } = useEntity()
  const [summary, setSummary] = useState({ income: 0, expense: 0 })
  const [trend, setTrend] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      let query = supabase.from('transactions').select('*').order('trx_date', { ascending: false })
      if (activeEntityId) query = query.eq('entity_id', activeEntityId)
      const { data } = await query
      if (cancelled || !data) return

      const income = data.filter(t => t.kind === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0)
      const expense = data.filter(t => t.kind === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0)
      setSummary({ income, expense })
      setRecent(data.slice(0, 6))

      const byMonth = {}
      data.forEach(t => {
        const m = t.trx_date?.slice(0, 7)
        if (!m) return
        byMonth[m] = byMonth[m] || { month: m, pemasukan: 0, pengeluaran: 0 }
        byMonth[m][t.kind] += Number(t.amount)
      })
      setTrend(Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [activeEntityId])

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="font-display text-xl font-semibold text-ink-900">Halo! Ini ringkasan {activeEntity?.legal_name}.</p>
        <p className="text-sm text-ink-400">Data diperbarui otomatis dari transaksi yang sudah dicatat.</p>
      </div>

      <section>
        <SectionEyebrow>Ringkasan</SectionEyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Total Pemasukan" value={summary.income} tone="positive" />
          <KpiCard label="Total Pengeluaran" value={summary.expense} tone="negative" />
          <KpiCard label="Saldo Bersih" value={summary.income - summary.expense} />
        </div>
      </section>

      <section>
        <SectionEyebrow>Aksi Cepat</SectionEyebrow>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ActionCard to="/transaksi/tambah?kind=pemasukan" title="Input Pemasukan" description="Catat uang masuk — otomatis masuk ke laporan yang sesuai." tone="income" icon="↓" />
          <ActionCard to="/transaksi/tambah?kind=pengeluaran" title="Input Pengeluaran" description="Catat uang keluar — otomatis masuk ke laporan yang sesuai." tone="expense" icon="↑" />
        </div>
      </section>

      <section>
        <SectionEyebrow>Tren Bulanan</SectionEyebrow>
        <div className="rounded-xl2 border border-lavender-200 bg-white p-5">
          {trend.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-400">Belum ada data transaksi.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEAF9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5C4A87' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5C4A87' }} />
                <Tooltip />
                <Line type="monotone" dataKey="pemasukan" stroke="#7EAE8F" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="pengeluaran" stroke="#D98AA0" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <SectionEyebrow>Transaksi Terbaru</SectionEyebrow>
        <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-white">
          {recent.length === 0 && !loading ? (
            <p className="py-12 text-center text-sm text-ink-400">Belum ada transaksi.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recent.map(t => (
                  <tr key={t.id} className="border-b border-lavender-100 last:border-0">
                    <td className="px-5 py-3 text-ink-400">{t.trx_date}</td>
                    <td className="px-5 py-3 text-ink-900">{t.description || '—'}</td>
                    <td className={`font-mono px-5 py-3 text-right font-medium ${t.kind === 'pemasukan' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {t.kind === 'pemasukan' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}

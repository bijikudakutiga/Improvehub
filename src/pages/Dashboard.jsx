import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useEntity } from '../contexts/EntityContext.jsx'
import { KpiCard, SectionEyebrow, ActionCard } from '../components/ui.jsx'
import QuoteTicker from '../components/QuoteTicker.jsx'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts'

const PIE_COLORS = ['#9B87C4', '#C9EAD8', '#F6DCC6', '#F3D2DA', '#CFE3F5', '#7E67AC', '#5C4A87']

export default function Dashboard() {
  const { activeEntityId, activeEntity } = useEntity()
  const [summary, setSummary] = useState({ income: 0, expense: 0 })
  const [trend, setTrend] = useState([])
  const [recent, setRecent] = useState([])
  const [expenseByCategory, setExpenseByCategory] = useState([])
  const [entityCompare, setEntityCompare] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      let query = supabase.from('transactions').select('*, categories(name), entities(legal_name)').order('trx_date', { ascending: false })
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

      const byCat = {}
      data.filter(t => t.kind === 'pengeluaran').forEach(t => {
        const name = t.categories?.name || 'Lainnya'
        byCat[name] = (byCat[name] || 0) + Number(t.amount)
      })
      setExpenseByCategory(Object.entries(byCat).map(([name, value]) => ({ name, value })))

      if (!activeEntityId) {
        const byEntity = {}
        data.forEach(t => {
          const name = t.entities?.legal_name || 'Lainnya'
          byEntity[name] = byEntity[name] || { name, pemasukan: 0, pengeluaran: 0 }
          byEntity[name][t.kind] += Number(t.amount)
        })
        setEntityCompare(Object.values(byEntity))
      }

      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [activeEntityId])

  return (
    <div className="space-y-6 pb-10 sm:space-y-8">
      <div>
        <p className="font-display text-lg font-semibold text-ink-900 sm:text-xl">Selamat datang di Laporan Keuangan Improve Hub.</p>
        <p className="text-sm text-ink-400">Data diperbarui otomatis dari transaksi yang sudah dicatat.</p>
      </div>

      <QuoteTicker />

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
        <div className="rounded-xl2 border border-lavender-200 bg-white p-4 sm:p-5">
          {trend.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-400">Belum ada data transaksi.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEAF9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5C4A87' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5C4A87' }} />
                <Tooltip />
                <Line type="monotone" dataKey="pemasukan" stroke="#7EAE8F" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="pengeluaran" stroke="#D98AA0" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <SectionEyebrow>Komposisi Pengeluaran</SectionEyebrow>
          <div className="rounded-xl2 border border-lavender-200 bg-white p-4 sm:p-5">
            {expenseByCategory.length === 0 ? (
              <p className="py-16 text-center text-sm text-ink-400">Belum ada data pengeluaran.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {expenseByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `Rp ${Number(v).toLocaleString('id-ID')}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div>
          <SectionEyebrow>{activeEntityId ? 'Ringkasan Bulan Ini' : 'Perbandingan Antar PT'}</SectionEyebrow>
          <div className="rounded-xl2 border border-lavender-200 bg-white p-4 sm:p-5">
            {!activeEntityId && entityCompare.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={entityCompare}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEAF9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#5C4A87' }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: '#5C4A87' }} />
                  <Tooltip formatter={v => `Rp ${Number(v).toLocaleString('id-ID')}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="pemasukan" fill="#7EAE8F" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pengeluaran" fill="#D98AA0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-16 text-center text-sm text-ink-400">
                {activeEntityId ? 'Pilih "IMPROVEHUB Group" untuk melihat perbandingan antar PT.' : 'Belum ada data.'}
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionEyebrow>Transaksi Terbaru</SectionEyebrow>
        <div className="overflow-x-auto rounded-xl2 border border-lavender-200 bg-white">
          {recent.length === 0 && !loading ? (
            <p className="py-12 text-center text-sm text-ink-400">Belum ada transaksi.</p>
          ) : (
            <table className="w-full min-w-[420px] text-sm">
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

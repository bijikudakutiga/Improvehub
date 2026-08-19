import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export default function Budget() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [form, setForm] = useState({ category_id: '', planned_amount: '' })

  const load = () => {
    if (!entityId) return
    supabase.from('categories').select('*').eq('entity_id', entityId).eq('kind', 'pengeluaran').then(({ data }) => setCategories(data || []))
    supabase.from('budgets').select('*, categories(name)').eq('entity_id', entityId).eq('period_month', period.month).eq('period_year', period.year)
      .then(({ data }) => setBudgets(data || []))
  }
  useEffect(load, [entityId, period])

  const submit = async e => {
    e.preventDefault()
    if (!form.category_id || !form.planned_amount) return
    await supabase.from('budgets').insert({ entity_id: entityId, category_id: form.category_id, period_month: period.month, period_year: period.year, planned_amount: Number(form.planned_amount) })
    setForm({ category_id: '', planned_amount: '' })
    load()
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionEyebrow>Anggaran per Kategori</SectionEyebrow>
        <div className="flex gap-2">
          <select value={period.month} onChange={e => setPeriod({ ...period, month: Number(e.target.value) })} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={period.year} onChange={e => setPeriod({ ...period, year: Number(e.target.value) })} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {!activeEntityId && <p className="mb-4 text-xs text-ink-400">Anggaran diatur per PT — menampilkan PT pertama. Pilih PT tertentu di atas untuk mengatur anggaran masing-masing.</p>}

      <form onSubmit={submit} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl2 border-2 border-dashed border-lavender-300 bg-white p-4">
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-ink-400">Kategori Pengeluaran</label>
          <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2 text-sm">
            <option value="">Pilih...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs font-medium text-ink-400">Jumlah Anggaran (Rp)</label>
          <input type="number" value={form.planned_amount} onChange={e => setForm({ ...form, planned_amount: e.target.value })} className="font-mono w-full rounded-xl border border-lavender-200 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90">+ Tambah</button>
      </form>

      <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 text-right font-medium">Anggaran</th>
            </tr>
          </thead>
          <tbody>
            {budgets.length === 0 && <tr><td colSpan={2} className="px-4 py-8 text-center text-ink-400">Belum ada anggaran untuk periode ini.</td></tr>}
            {budgets.map(b => (
              <tr key={b.id} className="border-b border-lavender-50 last:border-0">
                <td className="px-4 py-3 text-ink-900">{b.categories?.name}</td>
                <td className="font-mono px-4 py-3 text-right text-ink-900">{fmt(b.planned_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

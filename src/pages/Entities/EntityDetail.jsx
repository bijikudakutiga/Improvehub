import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, KpiCard } from '../../components/ui.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function EntityDetail({ code }) {
  const { entities, setActiveEntityId } = useEntity()
  const entity = entities.find(e => e.code === code)
  const [summary, setSummary] = useState({ income: 0, expense: 0, assetCount: 0 })

  useEffect(() => {
    if (!entity) return
    setActiveEntityId(entity.id)
    async function load() {
      const { data: trx } = await supabase.from('transactions').select('kind, amount').eq('entity_id', entity.id)
      const { count } = await supabase.from('fixed_assets').select('id', { count: 'exact', head: true }).eq('entity_id', entity.id)
      const income = trx?.filter(t => t.kind === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0) || 0
      const expense = trx?.filter(t => t.kind === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0) || 0
      setSummary({ income, expense, assetCount: count || 0 })
    }
    load()
  }, [entity?.id])

  if (!entity) return <p className="text-sm text-ink-400">Memuat data entitas...</p>

  return (
    <div>
      <SectionEyebrow>{entity.legal_name}</SectionEyebrow>
      <div className="mb-5 rounded-xl2 border border-lavender-200 bg-white p-5">
        <p className="text-xs text-ink-400">NPWP</p>
        <p className="font-mono mb-3 text-sm text-ink-900">{entity.npwp}</p>
        <p className="text-xs text-ink-400">Alamat</p>
        <p className="text-sm text-ink-900">{entity.address}</p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Pemasukan" value={summary.income} tone="positive" />
        <KpiCard label="Total Pengeluaran" value={summary.expense} tone="negative" />
        <div className="rounded-xl2 border border-lavender-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Jumlah Aset Tetap</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">{summary.assetCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/" className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90">Buka Dashboard PT Ini</Link>
        <Link to="/pengaturan/profil" className="rounded-xl border border-lavender-200 px-4 py-2 text-xs font-medium text-ink-900 hover:bg-lavender-50">Edit Profil Perusahaan</Link>
      </div>
    </div>
  )
}

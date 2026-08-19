import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'
import { PPH_BADAN_RATE } from '../../lib/taxCalc.js'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function PPhBadan() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [labaKomersial, setLabaKomersial] = useState(0)
  const [koreksiFiskal, setKoreksiFiskal] = useState(0)

  useEffect(() => {
    if (!entityId) return
    const start = `${year}-01-01`
    const end = `${year}-12-31`
    supabase.from('transactions').select('kind, amount').eq('entity_id', entityId).gte('trx_date', start).lte('trx_date', end)
      .then(({ data }) => {
        const income = data?.filter(t => t.kind === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0) || 0
        const expense = data?.filter(t => t.kind === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0) || 0
        setLabaKomersial(income - expense)
      })
  }, [entityId, year])

  const labaFiskal = Math.max(0, labaKomersial + Number(koreksiFiskal || 0))
  const pphBadan = labaFiskal * PPH_BADAN_RATE
  const pph25Monthly = pphBadan / 12

  return (
    <div className="max-w-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionEyebrow>PPh Badan — Estimasi PPh 25/29</SectionEyebrow>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
          {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <p className="mb-4 rounded-xl bg-lavender-50 px-4 py-3 text-xs text-ink-400">
        ⚠ Ini estimasi kasar dari Laba Rugi komersial. Laba fiskal sesungguhnya perlu koreksi positif/negatif
        (mis. beban tidak dapat dikurangkan, penyusutan fiskal berbeda) — konsultasikan dengan akuntan/konsultan
        pajak sebelum digunakan untuk SPT Tahunan 1771.
      </p>

      <div className="space-y-4 rounded-xl2 border border-lavender-200 bg-white p-6">
        <div className="flex justify-between text-sm"><span className="text-ink-400">Laba Komersial (dari Laba Rugi {year})</span><span className="font-mono text-ink-900">{fmt(labaKomersial)}</span></div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Koreksi Fiskal (+/-, opsional)</label>
          <input type="number" value={koreksiFiskal} onChange={e => setKoreksiFiskal(e.target.value)} className="font-mono w-full rounded-xl border border-lavender-200 px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-between border-t border-lavender-100 pt-3 text-sm font-medium"><span>Laba Fiskal</span><span className="font-mono">{fmt(labaFiskal)}</span></div>
        <div className="rounded-xl bg-lavender-100 px-4 py-3">
          <p className="text-xs text-ink-400">PPh Badan Terutang (tarif 22%)</p>
          <p className="font-mono text-xl font-semibold text-ink-900">{fmt(pphBadan)}</p>
        </div>
        <div className="rounded-xl bg-mint/30 px-4 py-3">
          <p className="text-xs text-ink-400">Estimasi Angsuran PPh 25/bulan</p>
          <p className="font-mono text-lg font-semibold text-ink-900">{fmt(pph25Monthly)}</p>
        </div>
      </div>
    </div>
  )
}

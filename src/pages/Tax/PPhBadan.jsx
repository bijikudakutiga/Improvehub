import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, RupiahInput } from '../../components/ui.jsx'
import { calculatePPhBadan } from '../../lib/taxCalc.js'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function PPhBadan() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [labaKomersial, setLabaKomersial] = useState(0)
  const [omzetOtomatis, setOmzetOtomatis] = useState(0)
  const [koreksiFiskal, setKoreksiFiskal] = useState('')
  const [omzetManual, setOmzetManual] = useState('')

  useEffect(() => {
    if (!entityId) return
    const start = `${year}-01-01`
    const end = `${year}-12-31`
    supabase.from('transactions').select('kind, amount').eq('entity_id', entityId).gte('trx_date', start).lte('trx_date', end)
      .then(({ data }) => {
        const income = data?.filter(t => t.kind === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0) || 0
        const expense = data?.filter(t => t.kind === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0) || 0
        setLabaKomersial(income - expense)
        setOmzetOtomatis(income)
      })
  }, [entityId, year])

  const labaFiskal = Math.max(0, labaKomersial + Number(koreksiFiskal || 0))
  const peredaranBruto = omzetManual !== '' ? Number(omzetManual) : omzetOtomatis
  const result = calculatePPhBadan(labaFiskal, peredaranBruto)
  const pph25Monthly = result.tax / 12

  return (
    <div className="max-w-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionEyebrow>PPh Badan — Estimasi PPh 25/29</SectionEyebrow>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
          {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <p className="mb-4 rounded-xl bg-lavender-50 px-4 py-3 text-xs text-ink-400">
        ⚠ Estimasi kasar dari Laba Rugi komersial. Laba fiskal sesungguhnya perlu koreksi positif/negatif
        (mis. beban tidak dapat dikurangkan, penyusutan fiskal berbeda) — konsultasikan dengan akuntan/konsultan
        pajak sebelum digunakan untuk SPT Tahunan 1771.
      </p>

      {result.eligible && (
        <p className="mb-4 rounded-xl bg-mint/30 px-4 py-3 text-xs text-emerald-700">
          ✓ Berhak fasilitas <strong>Pasal 31E UU PPh</strong> (diskon 50% tarif, jadi ~11%) untuk bagian penghasilan
          kena pajak dari omzet sampai Rp4,8 miliar — karena omzet tahunan ≤ Rp50 miliar. Catatan: sejak PP 20/2026,
          PT sudah tidak bisa pakai skema Final 0,5% (PP 23/2018) — skema itu sekarang khusus WP orang pribadi,
          perseroan perorangan 1 pemilik, dan koperasi.
        </p>
      )}

      <div className="space-y-4 rounded-xl2 border border-lavender-200 bg-white p-6">
        <div className="flex justify-between text-sm"><span className="text-ink-400">Laba Komersial (dari Laba Rugi {year})</span><span className="font-mono text-ink-900">{fmt(labaKomersial)}</span></div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Koreksi Fiskal (+/-, opsional)</label>
          <input type="number" value={koreksiFiskal} onChange={e => setKoreksiFiskal(e.target.value)} className="font-mono w-full rounded-xl border border-lavender-200 px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-between border-t border-lavender-100 pt-3 text-sm font-medium"><span>Laba Fiskal (PKP)</span><span className="font-mono">{fmt(labaFiskal)}</span></div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Peredaran Bruto / Omzet Setahun (Rp)</label>
          <RupiahInput value={omzetManual !== '' ? omzetManual : String(omzetOtomatis)} onChange={setOmzetManual} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
          <p className="mt-1 text-xs text-ink-400">Otomatis dari total Pemasukan tahun ini — ubah manual kalau ada penghasilan di luar transaksi tercatat.</p>
        </div>

        {result.eligible && (
          <div className="space-y-1 rounded-xl bg-lavender-50 px-4 py-3 text-xs text-ink-400">
            <div className="flex justify-between"><span>PKP kena tarif 11% (fasilitas)</span><span className="font-mono">{fmt(result.pkpDiskon)}</span></div>
            <div className="flex justify-between"><span>PKP kena tarif 22% (di atas Rp4,8M)</span><span className="font-mono">{fmt(result.pkpNormal)}</span></div>
          </div>
        )}

        <div className="rounded-xl bg-lavender-100 px-4 py-3">
          <p className="text-xs text-ink-400">PPh Badan Terutang{result.eligible ? ' (sudah dengan fasilitas Pasal 31E)' : ' (tarif umum 22%, omzet > Rp50 miliar)'}</p>
          <p className="font-mono text-xl font-semibold text-ink-900">{fmt(result.tax)}</p>
        </div>
        <div className="rounded-xl bg-mint/30 px-4 py-3">
          <p className="text-xs text-ink-400">Estimasi Angsuran PPh 25/bulan</p>
          <p className="font-mono text-lg font-semibold text-ink-900">{fmt(pph25Monthly)}</p>
        </div>
      </div>
    </div>
  )
}

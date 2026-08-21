import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'
import { calculatePPN } from '../../lib/taxCalc.js'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export default function PPN() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [omzet, setOmzet] = useState(0)
  const [belanja, setBelanja] = useState(0)

  useEffect(() => {
    if (!entityId) return
    const start = `${period.year}-${String(period.month).padStart(2, '0')}-01`
    const end = new Date(period.year, period.month, 0).toISOString().slice(0, 10)
    supabase.from('transactions').select('kind, amount').eq('entity_id', entityId).gte('trx_date', start).lte('trx_date', end)
      .then(({ data }) => {
        setOmzet(data?.filter(t => t.kind === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0) || 0)
        setBelanja(data?.filter(t => t.kind === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0) || 0)
      })
  }, [entityId, period])

  const pajakKeluaran = calculatePPN(omzet)
  const pajakMasukan = calculatePPN(belanja)
  const kurangBayar = pajakKeluaran - pajakMasukan

  const save = async () => {
    const entryDate = new Date(period.year, period.month, 0).toISOString().slice(0, 10)
    await supabase.from('tax_filings').insert({
      entity_id: entityId, tax_type: 'ppn', period_month: period.month, period_year: period.year,
      taxable_amount: omzet, tax_amount: Math.max(0, kurangBayar)
    })
    if (kurangBayar > 0) {
      await supabase.rpc('fn_record_tax_liability', {
        p_entity_id: entityId, p_tax_type: 'ppn', p_amount: kurangBayar, p_entry_date: entryDate
      })
    }
    alert('Kewajiban PPN periode ini tersimpan di Ringkasan Pajak dan Laporan Neraca.')
  }

  return (
    <div className="max-w-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionEyebrow>PPN — Pajak Pertambahan Nilai</SectionEyebrow>
        <div className="flex gap-2">
          <select value={period.month} onChange={e => setPeriod({ ...period, month: Number(e.target.value) })} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={period.year} onChange={e => setPeriod({ ...period, year: Number(e.target.value) })} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
            {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <p className="mb-4 rounded-xl bg-lavender-50 px-4 py-3 text-xs text-ink-400">
        Tarif efektif 11% untuk barang/jasa non-mewah (berlaku 2026). Barang mewah kena PPnBM tambahan — hitung manual di luar modul ini.
        Dihitung otomatis dari total pemasukan (asumsi = penyerahan kena pajak) dan pengeluaran (asumsi = perolehan kena pajak) periode ini —
        sesuaikan jika ada transaksi non-PPN.
      </p>
      <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
        ⚠ Modul ini mengasumsikan PT sudah berstatus <strong>PKP (Pengusaha Kena Pajak)</strong>. Kewajiban memungut PPN baru berlaku
        wajib kalau omzet setahun sudah lebih dari Rp4,8 miliar — kalau di bawah itu dan belum daftar PKP, PT belum wajib memungut PPN sama sekali.
      </p>

      <div className="space-y-3 rounded-xl2 border border-lavender-200 bg-white p-6">
        <div className="flex justify-between text-sm"><span className="text-ink-400">Pajak Keluaran (dari Rp {omzet.toLocaleString('id-ID')})</span><span className="font-mono text-ink-900">{fmt(pajakKeluaran)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-ink-400">Pajak Masukan (dari Rp {belanja.toLocaleString('id-ID')})</span><span className="font-mono text-ink-900">{fmt(pajakMasukan)}</span></div>
        <div className={`flex justify-between rounded-xl px-4 py-3 text-sm font-semibold ${kurangBayar >= 0 ? 'bg-blush/40 text-rose-700' : 'bg-mint/40 text-emerald-700'}`}>
          <span>{kurangBayar >= 0 ? 'Kurang Bayar' : 'Lebih Bayar'}</span>
          <span className="font-mono">{fmt(Math.abs(kurangBayar))}</span>
        </div>
        <button onClick={save} className="w-full rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-white hover:opacity-90">
          Catat sebagai Kewajiban Periode Ini
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const TAX_LABEL = { pph21: 'PPh 21', pph23: 'PPh 23', pph26: 'PPh 26', ppn: 'PPN', pph25: 'PPh 25', pph_badan: 'PPh Badan' }

export default function TaxSummary() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const [filings, setFilings] = useState([])

  useEffect(() => {
    if (!entityId) return
    supabase.from('tax_filings').select('*').eq('entity_id', entityId).order('period_year', { ascending: false }).order('period_month', { ascending: false }).limit(20)
      .then(({ data }) => setFilings(data || []))
  }, [entityId])

  const totalBelumBayar = filings.filter(f => f.status === 'belum_bayar').reduce((s, f) => s + Number(f.tax_amount), 0)

  const MODULES = [
    { to: '/pajak/pph-21', label: 'PPh 21', desc: 'Pajak penghasilan karyawan' },
    { to: '/pajak/pph-23-26', label: 'PPh 23/26', desc: 'Pemotongan jasa & sewa' },
    { to: '/pajak/ppn', label: 'PPN', desc: 'Pajak pertambahan nilai' },
    { to: '/pajak/pph-badan', label: 'PPh Badan', desc: 'Estimasi PPh 25/29' },
    { to: '/pajak/kalender', label: 'Kalender Pajak', desc: 'Jadwal jatuh tempo' },
    { to: '/pajak/lapor', label: 'Lapor Pajak', desc: 'Ringkasan siap unduh' }
  ]

  return (
    <div>
      <SectionEyebrow>Ringkasan Pajak</SectionEyebrow>
      <div className="mb-6 rounded-xl2 border border-lavender-200 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Total Kewajiban Belum Dibayar</p>
        <p className="font-mono mt-1 text-2xl font-semibold text-rose-500">{fmt(totalBelumBayar)}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MODULES.map(m => (
          <Link key={m.to} to={m.to} className="rounded-xl2 border border-lavender-200 bg-white p-4 transition-colors hover:border-lavender-400 hover:bg-lavender-50">
            <p className="text-sm font-semibold text-ink-900">{m.label}</p>
            <p className="mt-1 text-xs text-ink-400">{m.desc}</p>
          </Link>
        ))}
      </div>

      <SectionEyebrow>Riwayat Catatan Pajak</SectionEyebrow>
      <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Periode</th>
              <th className="px-4 py-3 text-right font-medium">Jumlah</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filings.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-ink-400">Belum ada catatan pajak.</td></tr>}
            {filings.map(f => (
              <tr key={f.id} className="border-b border-lavender-50 last:border-0">
                <td className="px-4 py-3 text-ink-900">{TAX_LABEL[f.tax_type]}</td>
                <td className="px-4 py-3 text-ink-400">{f.period_month}/{f.period_year}</td>
                <td className="font-mono px-4 py-3 text-right text-ink-900">{fmt(f.tax_amount)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${f.status === 'sudah_bayar' || f.status === 'sudah_lapor' ? 'bg-mint/50 text-emerald-700' : 'bg-blush/50 text-rose-600'}`}>
                    {f.status === 'belum_bayar' ? 'Belum Bayar' : f.status === 'sudah_bayar' ? 'Sudah Bayar' : 'Sudah Lapor'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, ExportBar } from '../../components/ui.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const TAX_LABEL = { pph21: 'PPh 21', pph23: 'PPh 23', pph26: 'PPh 26', ppn: 'PPN', pph25: 'PPh 25', pph_badan: 'PPh Badan' }
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export default function LaporPajak() {
  const { activeEntityId, entities, activeEntity } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [filings, setFilings] = useState([])
  const entity = entities.find(e => e.id === entityId)

  useEffect(() => {
    if (!entityId) return
    supabase.from('tax_filings').select('*').eq('entity_id', entityId).eq('period_month', period.month).eq('period_year', period.year)
      .then(({ data }) => setFilings(data || []))
  }, [entityId, period])

  const total = filings.reduce((s, f) => s + Number(f.tax_amount), 0)

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionEyebrow>Lapor Pajak — Ringkasan Periode</SectionEyebrow>
        <div className="flex gap-2 print:hidden">
          <select value={period.month} onChange={e => setPeriod({ ...period, month: Number(e.target.value) })} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={period.year} onChange={e => setPeriod({ ...period, year: Number(e.target.value) })} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
            {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {filings.length > 0 && (
        <ExportBar filename={`lapor-pajak-${period.month}-${period.year}`} rows={filings} columns={[
          { label: 'Jenis Pajak', value: r => TAX_LABEL[r.tax_type] },
          { label: 'Jumlah', key: 'tax_amount' },
          { label: 'Status', key: 'status' }
        ]} />
      )}

      <div className="rounded-xl2 border border-lavender-200 bg-white p-6">
        <div className="mb-5 border-b border-lavender-100 pb-4 text-center">
          <p className="font-display text-sm font-semibold text-ink-900">{entity?.legal_name}</p>
          <p className="font-mono text-xs text-ink-400">NPWP: {entity?.npwp}</p>
          <p className="mt-1 text-xs text-ink-400">{entity?.address}</p>
          <p className="mt-2 text-xs font-medium text-lavender-500">Ringkasan Kewajiban Pajak — {MONTHS[period.month - 1]} {period.year}</p>
        </div>

        {filings.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-400">Belum ada catatan pajak untuk periode ini. Isi dulu di modul PPh 21 / PPh 23 / PPN / PPh Badan.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {filings.map(f => (
                <tr key={f.id} className="border-b border-lavender-50">
                  <td className="py-2 text-ink-900">{TAX_LABEL[f.tax_type]}</td>
                  <td className="font-mono py-2 text-right text-ink-900">{fmt(f.tax_amount)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-3 font-semibold text-ink-900">Total</td>
                <td className="font-mono py-3 text-right font-semibold text-ink-900">{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

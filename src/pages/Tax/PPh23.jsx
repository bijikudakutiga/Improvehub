import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'
import { calculatePPh23 } from '../../lib/taxCalc.js'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function PPh23() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('pph23')
  const [saved, setSaved] = useState(false)

  const tax = calculatePPh23(Number(amount) || 0)
  const rate = type === 'pph23' ? '2%' : '20%'
  const taxAmount = type === 'pph23' ? tax : (Number(amount) || 0) * 0.20

  const save = async () => {
    const now = new Date()
    await supabase.from('tax_filings').insert({
      entity_id: entityId, tax_type: type, period_month: now.getMonth() + 1, period_year: now.getFullYear(),
      taxable_amount: Number(amount), tax_amount: taxAmount
    })
    await supabase.rpc('fn_record_tax_liability', {
      p_entity_id: entityId, p_tax_type: type, p_amount: taxAmount, p_entry_date: now.toISOString().slice(0, 10)
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg">
      <SectionEyebrow>PPh 23/26 — Pemotongan Jasa & Sewa</SectionEyebrow>
      <p className="mb-4 text-xs text-ink-400">
        PPh 23 (2%): dikenakan atas jasa, sewa (selain tanah/bangunan), royalti, dan bunga ke pihak dalam negeri.
        PPh 26 (20%): dikenakan atas pembayaran serupa ke pihak luar negeri (bisa lebih rendah jika ada tax treaty/DGT-1).
      </p>

      <div className="space-y-4 rounded-xl2 border border-lavender-200 bg-white p-6">
        <div className="flex gap-2 rounded-xl bg-lavender-50 p-1">
          <button onClick={() => setType('pph23')} className={`flex-1 rounded-lg py-2 text-sm font-medium ${type === 'pph23' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400'}`}>PPh 23 (Dalam Negeri)</button>
          <button onClick={() => setType('pph26')} className={`flex-1 rounded-lg py-2 text-sm font-medium ${type === 'pph26' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400'}`}>PPh 26 (Luar Negeri)</button>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Jumlah Bruto Pembayaran (Rp)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="font-mono w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>
        <div className="rounded-xl bg-lavender-100 px-4 py-3">
          <p className="text-xs text-ink-400">Tarif {rate} × Rp {Number(amount || 0).toLocaleString('id-ID')}</p>
          <p className="font-mono text-lg font-semibold text-ink-900">{fmt(taxAmount)}</p>
        </div>
        <button onClick={save} disabled={!amount} className="w-full rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          {saved ? 'Tersimpan ✓' : 'Catat sebagai Kewajiban'}
        </button>
      </div>
    </div>
  )
}

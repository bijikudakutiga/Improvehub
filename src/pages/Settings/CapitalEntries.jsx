import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, RupiahInput } from '../../components/ui.jsx'

export default function CapitalEntries() {
  const { entities } = useEntity()
  const [form, setForm] = useState({
    entity_id: '', entry_type: 'modal_disetor', amount: '',
    entry_date: new Date().toISOString().slice(0, 10), description: ''
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = async e => {
    e.preventDefault()
    setMsg('')
    const entityId = form.entity_id || entities[0]?.id
    const amountNum = Number(form.amount)
    if (!entityId || !amountNum) return

    setSaving(true)
    const { error } = await supabase.rpc('fn_add_capital_entry', {
      p_entity_id: entityId,
      p_entry_type: form.entry_type,
      p_amount: amountNum,
      p_entry_date: form.entry_date,
      p_description: form.description
    })
    setSaving(false)
    if (error) { setMsg('⚠ ' + error.message); return }
    setMsg('✓ Tersimpan — cek Laporan Neraca untuk melihat perubahannya.')
    setForm({ ...form, amount: '', description: '' })
  }

  return (
    <div className="max-w-lg">
      <SectionEyebrow>Modal & Utang Lain</SectionEyebrow>
      <p className="mb-4 text-xs text-ink-400">
        Untuk mencatat setoran modal pemilik atau utang di luar transaksi harian biasa (misalnya pinjaman dari pihak lain).
        Ini langsung memengaruhi bagian Kewajiban/Ekuitas di Laporan Neraca.
      </p>

      <form onSubmit={submit} className="space-y-4 rounded-xl2 border border-lavender-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">PT</label>
          <select value={form.entity_id} onChange={e => setForm({ ...form, entity_id: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm">
            {entities.map(e => <option key={e.id} value={e.id}>{e.legal_name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Jenis</label>
          <div className="flex gap-2 rounded-xl bg-lavender-50 p-1">
            <button type="button" onClick={() => setForm({ ...form, entry_type: 'modal_disetor' })} className={`flex-1 rounded-lg py-2 text-sm font-medium ${form.entry_type === 'modal_disetor' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400'}`}>Modal Disetor</button>
            <button type="button" onClick={() => setForm({ ...form, entry_type: 'utang_lain' })} className={`flex-1 rounded-lg py-2 text-sm font-medium ${form.entry_type === 'utang_lain' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400'}`}>Utang Lain-lain</button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Jumlah (Rp)</label>
          <RupiahInput required value={form.amount} onChange={v => setForm({ ...form, amount: v })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Tanggal</label>
          <input type="date" required value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Keterangan</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Contoh: Setoran modal awal pendirian PT" className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>

        {msg && <p className={`rounded-lg px-3 py-2 text-xs ${msg.startsWith('✓') ? 'bg-mint/30 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>{msg}</p>}

        <button type="submit" disabled={saving} className="w-full rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  )
}

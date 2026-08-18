import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

export default function AddTransaction() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { entities, activeEntityId } = useEntity()
  const [kind, setKind] = useState(params.get('kind') === 'pengeluaran' ? 'pengeluaran' : 'pemasukan')
  const [entityId, setEntityId] = useState(activeEntityId || entities[0]?.id || '')
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ category_id: '', amount: '', trx_date: new Date().toISOString().slice(0, 10), description: '', counterparty: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!entityId) return
    supabase.from('categories').select('*').eq('entity_id', entityId).eq('kind', kind)
      .then(({ data }) => setCategories(data || []))
  }, [entityId, kind])

  useEffect(() => { if (!entityId && entities[0]) setEntityId(entities[0].id) }, [entities])

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('transactions').insert({
      entity_id: entityId,
      category_id: form.category_id || null,
      kind,
      amount: Number(form.amount),
      trx_date: form.trx_date,
      description: form.description,
      counterparty: form.counterparty,
      created_by: user?.id
    })
    setSaving(false)
    if (!error) { setDone(true); setTimeout(() => navigate('/transaksi'), 900) }
  }

  const isIncome = kind === 'pemasukan'

  return (
    <div className="max-w-xl">
      <SectionEyebrow>{isIncome ? 'Input Pemasukan' : 'Input Pengeluaran'}</SectionEyebrow>

      <div className="mb-5 flex gap-2 rounded-xl bg-lavender-50 p-1">
        <button onClick={() => setKind('pemasukan')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${isIncome ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400'}`}>Pemasukan</button>
        <button onClick={() => setKind('pengeluaran')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${!isIncome ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400'}`}>Pengeluaran</button>
      </div>

      <form onSubmit={submit} className={`space-y-4 rounded-xl2 border-2 bg-white p-6 ${isIncome ? 'border-mint' : 'border-blush'}`}>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">PT</label>
          <select value={entityId} onChange={e => setEntityId(e.target.value)} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm">
            {entities.map(e => <option key={e.id} value={e.id}>{e.legal_name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Kategori</label>
          <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm">
            <option value="">Pilih kategori...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Jumlah (Rp)</label>
          <input type="number" min="1" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="font-mono w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Tanggal</label>
          <input type="date" required value={form.trx_date} onChange={e => setForm({ ...form, trx_date: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Keterangan</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Contoh: Pembayaran jasa konsultasi Klien A" className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Nama Pihak (opsional)</label>
          <input value={form.counterparty} onChange={e => setForm({ ...form, counterparty: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>

        <button type="submit" disabled={saving} className={`w-full rounded-xl py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${isIncome ? 'bg-emerald-600' : 'bg-rose-500'}`}>
          {saving ? 'Menyimpan...' : done ? 'Tersimpan ✓' : `Simpan ${isIncome ? 'Pemasukan' : 'Pengeluaran'}`}
        </button>
      </form>
    </div>
  )
}

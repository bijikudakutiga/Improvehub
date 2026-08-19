import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, RupiahInput } from '../../components/ui.jsx'

export default function AddTransaction() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { entities, activeEntityId, loading: entitiesLoading } = useEntity()
  const [kind, setKind] = useState(params.get('kind') === 'pengeluaran' ? 'pengeluaran' : 'pemasukan')
  const [entityId, setEntityId] = useState(activeEntityId || entities[0]?.id || '')
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ category_id: '', amount: '', trx_date: new Date().toISOString().slice(0, 10), description: '', counterparty: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!entityId) return
    supabase.from('categories').select('*').eq('entity_id', entityId).eq('kind', kind)
      .then(({ data }) => setCategories(data || []))
  }, [entityId, kind])

  useEffect(() => { if (!entityId && entities[0]) setEntityId(entities[0].id) }, [entities])

  const submit = async e => {
    e.preventDefault()
    setErrorMsg('')

    if (!entityId) { setErrorMsg('PT belum terpilih. Coba muat ulang halaman.'); return }
    if (!form.category_id) { setErrorMsg('Pilih kategori terlebih dahulu.'); return }
    const amountNum = Number(form.amount)
    if (!form.amount || isNaN(amountNum) || amountNum <= 0) { setErrorMsg('Jumlah harus diisi dan lebih dari 0.'); return }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('transactions').insert({
        entity_id: entityId,
        category_id: form.category_id,
        kind,
        amount: amountNum,
        trx_date: form.trx_date,
        description: form.description,
        counterparty: form.counterparty,
        created_by: user?.id
      })
      if (error) throw error
      setDone(true)
      setTimeout(() => navigate('/transaksi'), 900)
    } catch (err) {
      setErrorMsg(err?.message || err?.error_description || 'Gagal menyimpan transaksi. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const isIncome = kind === 'pemasukan'

  return (
    <div className="max-w-xl">
      <SectionEyebrow>{isIncome ? 'Input Pemasukan' : 'Input Pengeluaran'}</SectionEyebrow>

      <div className="mb-5 flex gap-2 rounded-xl bg-lavender-50 p-1">
        <button type="button" onClick={() => setKind('pemasukan')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${isIncome ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400'}`}>Pemasukan</button>
        <button type="button" onClick={() => setKind('pengeluaran')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${!isIncome ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-400'}`}>Pengeluaran</button>
      </div>

      <form onSubmit={submit} className={`space-y-4 rounded-xl2 border-2 bg-white p-6 ${isIncome ? 'border-mint' : 'border-blush'}`}>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">PT</label>
          <select value={entityId} onChange={e => setEntityId(e.target.value)} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm">
            {entitiesLoading && <option>Memuat daftar PT...</option>}
            {!entitiesLoading && entities.length === 0 && <option>Belum ada PT terdaftar</option>}
            {entities.map(e => <option key={e.id} value={e.id}>{e.legal_name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Kategori</label>
          <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm">
            <option value="">Pilih kategori...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {categories.length === 0 && <p className="mt-1 text-xs text-amber-600">Belum ada kategori {isIncome ? 'pemasukan' : 'pengeluaran'} untuk PT ini — tambahkan dulu di Pengaturan → Kategori.</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Jumlah (Rp)</label>
          <RupiahInput required value={form.amount} onChange={v => setForm({ ...form, amount: v })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
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

        {errorMsg && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">⚠ {errorMsg}</p>}

        <button type="submit" disabled={saving} className={`w-full rounded-xl py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${isIncome ? 'bg-emerald-600' : 'bg-rose-500'}`}>
          {saving ? 'Menyimpan...' : done ? 'Tersimpan ✓' : `Simpan ${isIncome ? 'Pemasukan' : 'Pengeluaran'}`}
        </button>
      </form>
    </div>
  )
}

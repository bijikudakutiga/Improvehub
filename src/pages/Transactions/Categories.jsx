import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

export default function Categories() {
  const { activeEntityId, entities } = useEntity()
  const [selectedEntityId, setSelectedEntityId] = useState('')
  const [cats, setCats] = useState([])
  const [form, setForm] = useState({ name: '', kind: 'pemasukan' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (activeEntityId) setSelectedEntityId(activeEntityId)
    else if (entities[0] && !selectedEntityId) setSelectedEntityId(entities[0].id)
  }, [activeEntityId, entities])

  const load = () => {
    if (!selectedEntityId) return
    supabase.from('categories').select('*').eq('entity_id', selectedEntityId).order('kind').then(({ data }) => setCats(data || []))
  }
  useEffect(load, [selectedEntityId])

  const submit = async e => {
    e.preventDefault()
    if (!form.name.trim() || !selectedEntityId) return
    setSaving(true)
    setMsg('')

    // Petakan otomatis ke akun default supaya kategori baru langsung muncul di semua laporan
    const defaultAccountCode = form.kind === 'pemasukan' ? '4-1002' : '5-1002'
    const { data: acc } = await supabase.from('accounts').select('id').eq('entity_id', selectedEntityId).eq('code', defaultAccountCode).single()

    const { error } = await supabase.from('categories').insert({
      name: form.name.trim(), kind: form.kind, entity_id: selectedEntityId, account_id: acc?.id || null
    })
    setSaving(false)
    if (error) { setMsg('⚠ ' + error.message); return }
    setForm({ name: '', kind: form.kind })
    load()
  }

  const remove = async id => {
    if (!confirm('Hapus kategori ini? Transaksi lama yang memakainya tidak ikut terhapus.')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  const income = cats.filter(c => c.kind === 'pemasukan')
  const expense = cats.filter(c => c.kind === 'pengeluaran')
  const selectedEntity = entities.find(e => e.id === selectedEntityId)

  return (
    <div>
      <SectionEyebrow>Kategori Transaksi</SectionEyebrow>

      <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border-2 border-dashed border-lavender-300 bg-white p-4 sm:grid-cols-4">
        <div className="sm:col-span-4">
          <label className="mb-1 block text-xs font-medium text-ink-400">PT — kategori akan dibuat khusus untuk PT ini</label>
          <select value={selectedEntityId} onChange={e => setSelectedEntityId(e.target.value)} className="w-full rounded-xl border border-lavender-200 px-3 py-2 text-sm">
            {entities.map(e => <option key={e.id} value={e.id}>{e.legal_name}</option>)}
          </select>
        </div>
        <input placeholder="Nama kategori baru" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-lavender-200 px-3 py-2 text-sm sm:col-span-2" />
        <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })} className="rounded-xl border border-lavender-200 px-3 py-2 text-sm">
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
        <button type="submit" disabled={saving} className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50">
          {saving ? 'Menyimpan...' : '+ Tambah Kategori'}
        </button>
        {msg && <p className="text-xs text-rose-600 sm:col-span-4">{msg}</p>}
      </form>

      {selectedEntity && <p className="mb-3 text-xs text-ink-400">Menampilkan kategori milik <strong>{selectedEntity.legal_name}</strong></p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl2 border border-mint bg-mint/10 p-5">
          <p className="font-display mb-3 text-sm font-semibold text-ink-900">Kategori Pemasukan</p>
          <ul className="space-y-2">
            {income.map(c => (
              <li key={c.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-ink-900">
                {c.name}
                <button onClick={() => remove(c.id)} className="text-xs text-rose-500 hover:underline">Hapus</button>
              </li>
            ))}
            {income.length === 0 && <p className="text-xs text-ink-400">Belum ada kategori.</p>}
          </ul>
        </div>
        <div className="rounded-xl2 border border-blush bg-blush/10 p-5">
          <p className="font-display mb-3 text-sm font-semibold text-ink-900">Kategori Pengeluaran</p>
          <ul className="space-y-2">
            {expense.map(c => (
              <li key={c.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-ink-900">
                {c.name}
                <button onClick={() => remove(c.id)} className="text-xs text-rose-500 hover:underline">Hapus</button>
              </li>
            ))}
            {expense.length === 0 && <p className="text-xs text-ink-400">Belum ada kategori.</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}

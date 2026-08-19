import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

export default function Categories() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const [cats, setCats] = useState([])
  const [form, setForm] = useState({ name: '', kind: 'pemasukan' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    if (!entityId) return
    supabase.from('categories').select('*').eq('entity_id', entityId).order('kind').then(({ data }) => setCats(data || []))
  }
  useEffect(load, [entityId])

  const submit = async e => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await supabase.from('categories').insert({ name: form.name.trim(), kind: form.kind, entity_id: entityId })
    setForm({ name: '', kind: form.kind })
    setSaving(false)
    load()
  }

  const remove = async id => {
    if (!confirm('Hapus kategori ini? Transaksi lama yang memakainya tidak ikut terhapus.')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  const income = cats.filter(c => c.kind === 'pemasukan')
  const expense = cats.filter(c => c.kind === 'pengeluaran')

  return (
    <div>
      <SectionEyebrow>Kategori Transaksi</SectionEyebrow>
      {!activeEntityId && <p className="mb-4 text-xs text-ink-400">Menampilkan kategori dari PT pertama — pilih PT tertentu di atas untuk mengelola kategori masing-masing.</p>}

      <form onSubmit={submit} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl2 border-2 border-dashed border-lavender-300 bg-white p-4">
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-ink-400">Nama Kategori Baru</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Komisi Penjualan" className="w-full rounded-xl border border-lavender-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Jenis</label>
          <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })} className="rounded-xl border border-lavender-200 px-3 py-2 text-sm">
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
        </div>
        <button type="submit" disabled={saving} className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50">
          {saving ? 'Menyimpan...' : '+ Tambah Kategori'}
        </button>
      </form>

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

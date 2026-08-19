import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

export default function CategorySettings() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const [cats, setCats] = useState([])
  const [accounts, setAccounts] = useState([])
  const [form, setForm] = useState({ name: '', kind: 'pengeluaran', account_id: '' })

  const load = () => {
    if (!entityId) return
    supabase.from('categories').select('*, accounts(name)').eq('entity_id', entityId).order('kind').then(({ data }) => setCats(data || []))
    supabase.from('accounts').select('*').eq('entity_id', entityId).order('code').then(({ data }) => setAccounts(data || []))
  }
  useEffect(load, [entityId])

  const submit = async e => {
    e.preventDefault()
    if (!form.name) return
    await supabase.from('categories').insert({ ...form, entity_id: entityId, account_id: form.account_id || null })
    setForm({ name: '', kind: 'pengeluaran', account_id: '' })
    load()
  }

  return (
    <div>
      <SectionEyebrow>Kategori & Pemetaan Akun</SectionEyebrow>
      {!activeEntityId && <p className="mb-4 text-xs text-ink-400">Menampilkan PT pertama — pilih PT tertentu di atas untuk mengatur kategorinya.</p>}

      <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border-2 border-dashed border-lavender-300 bg-white p-4 sm:grid-cols-4">
        <input placeholder="Nama kategori baru" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-lavender-200 px-3 py-2 text-sm sm:col-span-2" />
        <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })} className="rounded-xl border border-lavender-200 px-3 py-2 text-sm">
          <option value="pengeluaran">Pengeluaran</option>
          <option value="pemasukan">Pemasukan</option>
        </select>
        <select value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })} className="rounded-xl border border-lavender-200 px-3 py-2 text-sm">
          <option value="">Pemetaan akun (opsional)</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
        </select>
        <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90 sm:col-span-4">+ Tambah Kategori</button>
      </form>

      <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Akun Terpetakan</th>
            </tr>
          </thead>
          <tbody>
            {cats.map(c => (
              <tr key={c.id} className="border-b border-lavender-50 last:border-0">
                <td className="px-4 py-3 text-ink-900">{c.name}</td>
                <td className="px-4 py-3 capitalize text-ink-400">{c.kind}</td>
                <td className="px-4 py-3 text-ink-400">{c.accounts?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

export default function CompanyProfile() {
  const { entities } = useEntity()
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (entities.length && !selectedId) setSelectedId(entities[0].id)
  }, [entities])

  useEffect(() => {
    const e = entities.find(x => x.id === selectedId)
    if (e) setForm({ legal_name: e.legal_name, npwp: e.npwp, address: e.address })
  }, [selectedId, entities])

  const save = async e => {
    e.preventDefault()
    await supabase.from('entities').update(form).eq('id', selectedId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!form) return null

  return (
    <div className="max-w-lg">
      <SectionEyebrow>Profil Perusahaan</SectionEyebrow>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {entities.map(e => (
          <button key={e.id} onClick={() => setSelectedId(e.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${selectedId === e.id ? 'bg-ink-900 text-white' : 'bg-lavender-50 text-ink-400 hover:bg-lavender-100'}`}>
            {e.code}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="space-y-4 rounded-xl2 border border-lavender-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Nama Resmi PT</label>
          <input value={form.legal_name} onChange={e => setForm({ ...form, legal_name: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">NPWP</label>
          <input value={form.npwp} onChange={e => setForm({ ...form, npwp: e.target.value })} placeholder="00.000.000.0-000.000" className="font-mono w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Alamat</label>
          <textarea rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
        </div>
        <button type="submit" className="w-full rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-white hover:opacity-90">
          {saved ? 'Tersimpan ✓' : 'Simpan Perubahan'}
        </button>
      </form>
      <p className="mt-3 text-xs text-ink-400">Data ini otomatis dipakai sebagai kop surat di semua laporan & dokumen pajak yang diunduh.</p>
    </div>
  )
}

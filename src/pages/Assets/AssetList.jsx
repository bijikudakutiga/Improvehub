import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, ExportBar } from '../../components/ui.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

function monthsSince(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()))
}

export function depreciationInfo(asset) {
  const monthly = (asset.acquisition_cost - (asset.salvage_value || 0)) / (asset.useful_life_years * 12)
  const elapsed = monthsSince(asset.acquisition_date)
  const totalMonths = asset.useful_life_years * 12
  const accumulated = Math.min(monthly * elapsed, asset.acquisition_cost - (asset.salvage_value || 0))
  const bookValue = asset.acquisition_cost - accumulated
  return { monthly, accumulated, bookValue, progress: Math.min(100, (elapsed / totalMonths) * 100) }
}

export default function AssetList() {
  const { activeEntityId, entities } = useEntity()
  const [assets, setAssets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', acquisition_date: new Date().toISOString().slice(0, 10), acquisition_cost: '', useful_life_years: 4, salvage_value: 0, entity_id: activeEntityId || '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    let query = supabase.from('fixed_assets').select('*, entities(legal_name)').order('acquisition_date', { ascending: false })
    if (activeEntityId) query = query.eq('entity_id', activeEntityId)
    query.then(({ data }) => setAssets(data || []))
  }

  useEffect(load, [activeEntityId])
  useEffect(() => { setForm(f => ({ ...f, entity_id: activeEntityId || entities[0]?.id || '' })) }, [activeEntityId, entities])

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      acquisition_cost: Number(form.acquisition_cost),
      useful_life_years: Number(form.useful_life_years),
      salvage_value: Number(form.salvage_value || 0)
    }
    const { data: inserted, error } = await supabase.from('fixed_assets').insert(payload).select().single()

    // Sambungkan ke jurnal supaya otomatis muncul di Neraca (akun Aset Tetap bertambah, Kas/Bank berkurang)
    if (!error && inserted) {
      const { data: acctAset } = await supabase.from('accounts').select('id').eq('entity_id', payload.entity_id).eq('subtype', 'aset_tetap').limit(1).single()
      const { data: acctKas } = await supabase.from('accounts').select('id').eq('entity_id', payload.entity_id).eq('subtype', 'kas_setara_kas').limit(1).single()
      if (acctAset && acctKas) {
        await supabase.from('journal_lines').insert([
          { account_id: acctAset.id, entity_id: payload.entity_id, debit: payload.acquisition_cost, credit: 0, trx_date: payload.acquisition_date },
          { account_id: acctKas.id, entity_id: payload.entity_id, debit: 0, credit: payload.acquisition_cost, trx_date: payload.acquisition_date }
        ])
      }
    }

    setSaving(false)
    setShowForm(false)
    setForm({ name: '', category: '', acquisition_date: new Date().toISOString().slice(0, 10), acquisition_cost: '', useful_life_years: 4, salvage_value: 0, entity_id: activeEntityId || entities[0]?.id || '' })
    load()
  }

  const totalCost = assets.reduce((s, a) => s + Number(a.acquisition_cost), 0)
  const totalBookValue = assets.reduce((s, a) => s + depreciationInfo(a).bookValue, 0)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <SectionEyebrow>Daftar Aset Tetap</SectionEyebrow>
        <button onClick={() => setShowForm(s => !s)} className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90">
          {showForm ? 'Tutup Form' : '+ Tambah Aset'}
        </button>
      </div>

      {!showForm && assets.length > 0 && (
        <ExportBar
          filename={`aset-tetap`}
          rows={assets}
          columns={[
            { label: 'Nama Aset', key: 'name' },
            { label: 'Kategori', key: 'category' },
            { label: 'Tgl Perolehan', key: 'acquisition_date' },
            { label: 'Harga Perolehan', key: 'acquisition_cost' },
            { label: 'Nilai Buku', value: r => Math.round(depreciationInfo(r).bookValue) }
          ]}
        />
      )}

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-4 rounded-xl2 border-2 border-dashed border-lavender-300 bg-white p-5 sm:grid-cols-2">
          {!activeEntityId && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-400">PT</label>
              <select value={form.entity_id} onChange={e => setForm({ ...form, entity_id: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm">
                {entities.map(e => <option key={e.id} value={e.id}>{e.legal_name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Nama Aset</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Kategori</label>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Kendaraan, Peralatan Kantor, dst" className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Tanggal Perolehan</label>
            <input type="date" required value={form.acquisition_date} onChange={e => setForm({ ...form, acquisition_date: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Harga Perolehan (Rp)</label>
            <input type="number" required value={form.acquisition_cost} onChange={e => setForm({ ...form, acquisition_cost: e.target.value })} className="font-mono w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Umur Ekonomis (tahun)</label>
            <input type="number" min="1" required value={form.useful_life_years} onChange={e => setForm({ ...form, useful_life_years: e.target.value })} className="w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Nilai Sisa (Rp, opsional)</label>
            <input type="number" value={form.salvage_value} onChange={e => setForm({ ...form, salvage_value: e.target.value })} className="font-mono w-full rounded-xl border border-lavender-200 px-3 py-2.5 text-sm" />
          </div>
          <button type="submit" disabled={saving} className="rounded-xl bg-ink-900 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 sm:col-span-2">
            {saving ? 'Menyimpan...' : 'Simpan Aset'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl2 border border-lavender-200 bg-white">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Aset</th>
              {!activeEntityId && <th className="px-4 py-3 font-medium">PT</th>}
              <th className="px-4 py-3 font-medium">Perolehan</th>
              <th className="px-4 py-3 text-right font-medium">Harga</th>
              <th className="px-4 py-3 text-right font-medium">Nilai Buku</th>
              <th className="px-4 py-3 font-medium">Progres Susut</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400">Belum ada aset tetap.</td></tr>}
            {assets.map(a => {
              const dep = depreciationInfo(a)
              return (
                <tr key={a.id} className="border-b border-lavender-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-ink-900">{a.name}</p>
                    <p className="text-xs text-ink-400">{a.category}</p>
                  </td>
                  {!activeEntityId && <td className="px-4 py-3 text-xs text-ink-400">{a.entities?.legal_name}</td>}
                  <td className="px-4 py-3 text-ink-400">{a.acquisition_date}</td>
                  <td className="font-mono px-4 py-3 text-right text-ink-900">{fmt(a.acquisition_cost)}</td>
                  <td className="font-mono px-4 py-3 text-right text-ink-900">{fmt(dep.bookValue)}</td>
                  <td className="px-4 py-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-lavender-100">
                      <div className="h-full bg-lavender-400" style={{ width: `${dep.progress}%` }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {assets.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl2 border border-lavender-200 bg-white p-4">
            <p className="text-xs text-ink-400">Total Harga Perolehan</p>
            <p className="font-mono text-lg font-semibold text-ink-900">{fmt(totalCost)}</p>
          </div>
          <div className="rounded-xl2 border border-lavender-200 bg-white p-4">
            <p className="text-xs text-ink-400">Total Nilai Buku Saat Ini</p>
            <p className="font-mono text-lg font-semibold text-ink-900">{fmt(totalBookValue)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

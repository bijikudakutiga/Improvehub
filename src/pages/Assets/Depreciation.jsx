import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'
import { depreciationInfo } from './AssetList.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function Depreciation() {
  const { activeEntityId, activeEntity } = useEntity()
  const [assets, setAssets] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let query = supabase.from('fixed_assets').select('*').order('acquisition_date', { ascending: false })
    if (activeEntityId) query = query.eq('entity_id', activeEntityId)
    query.then(({ data }) => setAssets(data || []))
  }, [activeEntityId])

  const schedule = asset => {
    const monthly = (asset.acquisition_cost - (asset.salvage_value || 0)) / (asset.useful_life_years * 12)
    const rows = []
    let acc = 0
    for (let y = 1; y <= asset.useful_life_years; y++) {
      const yearlyDep = monthly * 12
      acc += yearlyDep
      rows.push({ year: y, dep: yearlyDep, acc: Math.min(acc, asset.acquisition_cost - (asset.salvage_value || 0)), bookValue: Math.max(asset.salvage_value || 0, asset.acquisition_cost - acc) })
    }
    return rows
  }

  return (
    <div>
      <SectionEyebrow>Penyusutan Aset — {activeEntity?.legal_name}</SectionEyebrow>
      <p className="mb-4 text-xs text-ink-400">Dihitung dengan metode garis lurus (straight-line): (Harga Perolehan − Nilai Sisa) ÷ Umur Ekonomis.</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-white">
            {assets.length === 0 && <p className="p-4 text-sm text-ink-400">Belum ada aset. Tambahkan di menu Daftar Aset.</p>}
            {assets.map(a => (
              <button key={a.id} onClick={() => setSelected(a)} className={`block w-full border-b border-lavender-50 px-4 py-3 text-left text-sm last:border-0 hover:bg-lavender-50 ${selected?.id === a.id ? 'bg-lavender-100 font-medium' : ''}`}>
                {a.name}
                <p className="text-xs text-ink-400">{fmt(a.acquisition_cost)}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          {!selected ? (
            <p className="rounded-xl2 border border-dashed border-lavender-300 bg-white/60 py-16 text-center text-sm text-ink-400">Pilih aset di sebelah kiri untuk melihat jadwal penyusutannya.</p>
          ) : (
            <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
                    <th className="px-4 py-3 font-medium">Tahun</th>
                    <th className="px-4 py-3 text-right font-medium">Beban Susut/Tahun</th>
                    <th className="px-4 py-3 text-right font-medium">Akumulasi</th>
                    <th className="px-4 py-3 text-right font-medium">Nilai Buku</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule(selected).map(r => (
                    <tr key={r.year} className="border-b border-lavender-50 last:border-0">
                      <td className="px-4 py-3 text-ink-900">Tahun {r.year}</td>
                      <td className="font-mono px-4 py-3 text-right text-ink-400">{fmt(r.dep)}</td>
                      <td className="font-mono px-4 py-3 text-right text-ink-400">{fmt(r.acc)}</td>
                      <td className="font-mono px-4 py-3 text-right font-medium text-ink-900">{fmt(r.bookValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

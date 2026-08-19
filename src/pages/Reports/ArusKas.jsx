import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, ExportBar } from '../../components/ui.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function ArusKas() {
  const { activeEntityId, activeEntity } = useEntity()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      let query = supabase.from('journal_lines').select('*, accounts(name, subtype)').eq('accounts.subtype', 'kas_setara_kas').order('trx_date', { ascending: false })
      if (activeEntityId) query = query.eq('entity_id', activeEntityId)
      const { data } = await query
      if (cancelled) return
      setRows((data || []).filter(r => r.accounts))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [activeEntityId])

  const byMonth = {}
  rows.forEach(r => {
    const m = r.trx_date?.slice(0, 7)
    byMonth[m] = byMonth[m] || { month: m, masuk: 0, keluar: 0 }
    byMonth[m].masuk += Number(r.debit)
    byMonth[m].keluar += Number(r.credit)
  })
  const monthly = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
  const totalMasuk = rows.reduce((s, r) => s + Number(r.debit), 0)
  const totalKeluar = rows.reduce((s, r) => s + Number(r.credit), 0)

  return (
    <div className="max-w-2xl">
      <SectionEyebrow>Laporan Arus Kas — {activeEntity?.legal_name}</SectionEyebrow>
      {!loading && (
        <ExportBar
          filename={`arus-kas-${activeEntity?.code || 'group'}`}
          rows={monthly}
          columns={[
            { label: 'Bulan', key: 'month' },
            { label: 'Kas Masuk', key: 'masuk' },
            { label: 'Kas Keluar', key: 'keluar' }
          ]}
        />
      )}
      {loading ? <p className="text-sm text-ink-400">Memuat...</p> : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-medium">Bulan</th>
                  <th className="px-5 py-3 text-right font-medium">Kas Masuk</th>
                  <th className="px-5 py-3 text-right font-medium">Kas Keluar</th>
                  <th className="px-5 py-3 text-right font-medium">Bersih</th>
                </tr>
              </thead>
              <tbody>
                {monthly.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-ink-400">Belum ada data.</td></tr>}
                {monthly.map(m => (
                  <tr key={m.month} className="border-b border-lavender-50 last:border-0">
                    <td className="px-5 py-3 text-ink-900">{m.month}</td>
                    <td className="font-mono px-5 py-3 text-right text-emerald-600">{fmt(m.masuk)}</td>
                    <td className="font-mono px-5 py-3 text-right text-rose-500">{fmt(m.keluar)}</td>
                    <td className="font-mono px-5 py-3 text-right font-medium text-ink-900">{fmt(m.masuk - m.keluar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl2 bg-lavender-100 px-5 py-4 text-sm font-semibold text-ink-900">
            <div className="flex justify-between"><span>Total Kas Masuk</span><span className="font-mono">{fmt(totalMasuk)}</span></div>
            <div className="flex justify-between"><span>Total Kas Keluar</span><span className="font-mono">{fmt(totalKeluar)}</span></div>
            <div className="mt-1 flex justify-between border-t border-lavender-200 pt-1"><span>Saldo Kas Bersih</span><span className="font-mono">{fmt(totalMasuk - totalKeluar)}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

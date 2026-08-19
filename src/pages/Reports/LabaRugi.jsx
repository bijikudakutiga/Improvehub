import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, ExportBar, ReportLetterhead } from '../../components/ui.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function LabaRugi() {
  const { activeEntityId, activeEntity } = useEntity()
  const [rows, setRows] = useState({ pendapatan: [], beban: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      let accQuery = supabase.from('accounts').select('*').in('type', ['pendapatan', 'beban'])
      if (activeEntityId) accQuery = accQuery.eq('entity_id', activeEntityId)
      const { data: accounts } = await accQuery

      let jlQuery = supabase.from('journal_lines').select('account_id, debit, credit')
      if (activeEntityId) jlQuery = jlQuery.eq('entity_id', activeEntityId)
      const { data: lines } = await jlQuery
      if (cancelled) return

      const balanceByAccount = {}
      lines?.forEach(l => {
        balanceByAccount[l.account_id] = (balanceByAccount[l.account_id] || 0) + Number(l.credit) - Number(l.debit)
      })

      const merged = {}
      accounts?.forEach(a => {
        const key = activeEntityId ? a.id : `${a.code}-${a.name}`
        if (!merged[key]) merged[key] = { ...a, balance: 0 }
        merged[key].balance += balanceByAccount[a.id] || 0
      })

      const all = Object.values(merged)
      setRows({
        pendapatan: all.filter(a => a.type === 'pendapatan'),
        beban: all.filter(a => a.type === 'beban').map(a => ({ ...a, balance: -a.balance }))
      })
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [activeEntityId])

  const totalPendapatan = rows.pendapatan.reduce((s, a) => s + a.balance, 0)
  const totalBeban = rows.beban.reduce((s, a) => s + a.balance, 0)
  const labaBersih = totalPendapatan - totalBeban

  return (
    <div className="max-w-2xl">
      <SectionEyebrow>Laporan Laba Rugi — {activeEntity?.legal_name}</SectionEyebrow>
      <ReportLetterhead entity={activeEntity} title="LAPORAN LABA RUGI" />
      {!loading && (
        <ExportBar
          filename={`laba-rugi-${activeEntity?.code || 'group'}`}
          rows={[...rows.pendapatan, ...rows.beban]}
          columns={[
            { label: 'Akun', key: 'name' },
            { label: 'Tipe', key: 'type' },
            { label: 'Jumlah', value: r => r.balance }
          ]}
        />
      )}
      {loading ? <p className="text-sm text-ink-400">Memuat...</p> : (
        <div className="space-y-5">
          <div className="rounded-xl2 border border-lavender-200 bg-white p-5">
            <p className="font-display mb-2 text-sm font-semibold text-ink-900">Pendapatan</p>
            {rows.pendapatan.map(a => (
              <div key={a.id || a.name} className="flex justify-between py-1 text-sm">
                <span className="text-ink-400">{a.name}</span>
                <span className="font-mono text-ink-900">{fmt(a.balance)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-lavender-100 pt-2 text-sm font-semibold">
              <span>Total Pendapatan</span><span className="font-mono">{fmt(totalPendapatan)}</span>
            </div>
          </div>

          <div className="rounded-xl2 border border-lavender-200 bg-white p-5">
            <p className="font-display mb-2 text-sm font-semibold text-ink-900">Beban</p>
            {rows.beban.map(a => (
              <div key={a.id || a.name} className="flex justify-between py-1 text-sm">
                <span className="text-ink-400">{a.name}</span>
                <span className="font-mono text-ink-900">{fmt(a.balance)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-lavender-100 pt-2 text-sm font-semibold">
              <span>Total Beban</span><span className="font-mono">{fmt(totalBeban)}</span>
            </div>
          </div>

          <div className={`rounded-xl2 px-5 py-4 text-base font-semibold ${labaBersih >= 0 ? 'bg-mint/40 text-emerald-800' : 'bg-blush/40 text-rose-700'}`}>
            <div className="flex justify-between">
              <span>{labaBersih >= 0 ? 'Laba Bersih' : 'Rugi Bersih'}</span>
              <span className="font-mono">{fmt(Math.abs(labaBersih))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

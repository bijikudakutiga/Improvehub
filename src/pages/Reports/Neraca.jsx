import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

const SUBTYPE_LABEL = {
  kas_setara_kas: 'Kas dan Setara Kas',
  piutang_usaha: 'Piutang Usaha',
  aset_tetap: 'Aset Tetap',
  utang_usaha: 'Utang Usaha',
  utang_pajak: 'Utang Pajak'
}

export default function Neraca() {
  const { activeEntityId, activeEntity } = useEntity()
  const [groups, setGroups] = useState({ aset: [], kewajiban: [], ekuitas: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      let accQuery = supabase.from('accounts').select('*').in('type', ['aset', 'kewajiban', 'ekuitas'])
      if (activeEntityId) accQuery = accQuery.eq('entity_id', activeEntityId)
      const { data: accounts } = await accQuery

      let jlQuery = supabase.from('journal_lines').select('account_id, debit, credit')
      if (activeEntityId) jlQuery = jlQuery.eq('entity_id', activeEntityId)
      const { data: lines } = await jlQuery
      if (cancelled) return

      const balanceByAccount = {}
      lines?.forEach(l => {
        balanceByAccount[l.account_id] = (balanceByAccount[l.account_id] || 0) + Number(l.debit) - Number(l.credit)
      })

      // Untuk multi-PT (Group), gabungkan akun dengan code yang sama antar entitas
      const merged = {}
      accounts?.forEach(a => {
        const key = activeEntityId ? a.id : `${a.code}-${a.name}`
        if (!merged[key]) merged[key] = { ...a, balance: 0 }
        merged[key].balance += balanceByAccount[a.id] || 0
      })

      const rows = Object.values(merged)
      const byType = t => rows.filter(r => r.type === t)
      setGroups({ aset: byType('aset'), kewajiban: byType('kewajiban'), ekuitas: byType('ekuitas') })
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [activeEntityId])

  const groupBySubtype = rows => {
    const out = {}
    rows.forEach(r => {
      const key = r.subtype || 'lainnya'
      out[key] = out[key] || []
      out[key].push(r)
    })
    return out
  }

  const totalAset = groups.aset.reduce((s, a) => s + a.balance, 0)
  const totalKewajiban = groups.kewajiban.reduce((s, a) => s + Math.abs(a.balance), 0)
  const totalEkuitas = groups.ekuitas.reduce((s, a) => s + Math.abs(a.balance), 0)

  const renderGroup = (title, rows, colorClass) => (
    <div>
      <p className="font-display mb-2 text-sm font-semibold text-ink-900">{title}</p>
      <div className="divide-y divide-lavender-100 rounded-xl2 border border-lavender-200 bg-white">
        {Object.entries(groupBySubtype(rows)).map(([subtype, accs]) => (
          <div key={subtype} className="px-5 py-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-lavender-500">{SUBTYPE_LABEL[subtype] || 'Lainnya'}</p>
            {accs.map(a => (
              <div key={a.id || a.name} className="flex justify-between py-0.5 text-sm">
                <span className="text-ink-400">{a.name}</span>
                <span className="font-mono text-ink-900">{fmt(Math.abs(a.balance))}</span>
              </div>
            ))}
          </div>
        ))}
        {rows.length === 0 && <p className="px-5 py-6 text-sm text-ink-400">Belum ada data.</p>}
      </div>
    </div>
  )

  return (
    <div>
      <SectionEyebrow>Laporan Neraca — {activeEntity?.legal_name}</SectionEyebrow>
      {loading ? (
        <p className="text-sm text-ink-400">Memuat...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {renderGroup('Aset', groups.aset)}
            <div className="rounded-xl2 bg-lavender-100 px-5 py-3 text-sm font-semibold text-ink-900">
              Total Aset <span className="font-mono float-right">{fmt(totalAset)}</span>
            </div>
          </div>
          <div className="space-y-4">
            {renderGroup('Kewajiban', groups.kewajiban)}
            {renderGroup('Ekuitas', groups.ekuitas)}
            <div className="rounded-xl2 bg-lavender-100 px-5 py-3 text-sm font-semibold text-ink-900">
              Total Kewajiban + Ekuitas <span className="font-mono float-right">{fmt(totalKewajiban + totalEkuitas)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

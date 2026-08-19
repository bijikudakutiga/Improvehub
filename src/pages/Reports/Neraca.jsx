import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow, ExportBar, ReportLetterhead } from '../../components/ui.jsx'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const MONTHS_LONG = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const SUBTYPE_LABEL = {
  kas_setara_kas: 'Kas dan Setara Kas',
  piutang_usaha: 'Piutang Usaha',
  aset_tetap: 'Aset Tetap',
  utang_usaha: 'Utang Usaha',
  utang_pajak: 'Utang Pajak'
}

function endOfMonth(year, month) {
  return new Date(year, month, 0).toISOString().slice(0, 10)
}

export default function Neraca() {
  const { activeEntityId, activeEntity, entities } = useEntity()
  const now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [groups, setGroups] = useState({ aset: [], kewajiban: [], ekuitas: [] })
  const [trialBalance, setTrialBalance] = useState([])
  const [loading, setLoading] = useState(true)

  const entity = activeEntityId ? entities.find(e => e.id === activeEntityId) : null
  const asOfDate = endOfMonth(period.year, period.month)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      let accQuery = supabase.from('accounts').select('*')
      if (activeEntityId) accQuery = accQuery.eq('entity_id', activeEntityId)
      const { data: accounts } = await accQuery

      let jlQuery = supabase.from('journal_lines').select('account_id, debit, credit').lte('trx_date', asOfDate)
      if (activeEntityId) jlQuery = jlQuery.eq('entity_id', activeEntityId)
      const { data: lines } = await jlQuery
      if (cancelled) return

      const debitByAccount = {}, creditByAccount = {}
      lines?.forEach(l => {
        debitByAccount[l.account_id] = (debitByAccount[l.account_id] || 0) + Number(l.debit)
        creditByAccount[l.account_id] = (creditByAccount[l.account_id] || 0) + Number(l.credit)
      })

      const merged = {}
      accounts?.forEach(a => {
        const key = activeEntityId ? a.id : `${a.code}-${a.name}`
        if (!merged[key]) merged[key] = { ...a, debit: 0, credit: 0 }
        merged[key].debit += debitByAccount[a.id] || 0
        merged[key].credit += creditByAccount[a.id] || 0
      })

      const rows = Object.values(merged).map(r => ({ ...r, balance: r.debit - r.credit }))
      const byType = t => rows.filter(r => r.type === t && (r.debit > 0 || r.credit > 0))
      setGroups({ aset: byType('aset'), kewajiban: byType('kewajiban'), ekuitas: byType('ekuitas') })
      setTrialBalance(rows.filter(r => r.debit > 0 || r.credit > 0).sort((a, b) => (a.code || '').localeCompare(b.code || '')))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [activeEntityId, asOfDate])

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
  const totalDebit = trialBalance.reduce((s, r) => s + r.debit, 0)
  const totalCredit = trialBalance.reduce((s, r) => s + r.credit, 0)

  const renderGroup = (title, rows) => (
    <div>
      <p className="font-display mb-2 text-sm font-semibold text-ink-900">{title}</p>
      <div className="divide-y divide-lavender-100 rounded-xl2 border border-lavender-200 bg-white">
        {Object.entries(groupBySubtype(rows)).map(([subtype, accs]) => (
          <div key={subtype} className="px-5 py-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-lavender-500">{SUBTYPE_LABEL[subtype] || 'Lainnya'}</p>
            {accs.map(a => (
              <div key={a.id || a.name} className="flex justify-between py-0.5 text-sm">
                <span className="text-ink-400">{a.code} — {a.name}</span>
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionEyebrow>Laporan Neraca</SectionEyebrow>
        <div className="flex gap-2 print:hidden">
          <select value={period.month} onChange={e => setPeriod({ ...period, month: Number(e.target.value) })} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
            {MONTHS_LONG.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={period.year} onChange={e => setPeriod({ ...period, year: Number(e.target.value) })} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {!loading && (
        <ExportBar
          filename={`neraca-${entity?.code || 'group'}-${period.month}-${period.year}`}
          rows={[
            { section: 'ASET', ...{} },
            ...groups.aset.map(r => ({ section: 'Aset', code: r.code, name: r.name, jumlah: Math.abs(r.balance) })),
            { section: 'Total Aset', jumlah: totalAset },
            ...groups.kewajiban.map(r => ({ section: 'Kewajiban', code: r.code, name: r.name, jumlah: Math.abs(r.balance) })),
            ...groups.ekuitas.map(r => ({ section: 'Ekuitas', code: r.code, name: r.name, jumlah: Math.abs(r.balance) })),
            { section: 'Total Kewajiban + Ekuitas', jumlah: totalKewajiban + totalEkuitas },
            ...trialBalance.map(r => ({ section: 'Neraca Saldo', code: r.code, name: r.name, debit: r.debit, kredit: r.credit }))
          ]}
          columns={[
            { label: 'Bagian', key: 'section' },
            { label: 'Kode', key: 'code' },
            { label: 'Akun', key: 'name' },
            { label: 'Jumlah', key: 'jumlah' },
            { label: 'Debit', key: 'debit' },
            { label: 'Kredit', key: 'kredit' }
          ]}
        />
      )}

      {/* Kop Surat — ikut tercetak di PDF */}
      <ReportLetterhead
        entity={entity || { legal_name: 'IMPROVEHUB', address: 'Jl. Singosari I No.27, Pleburan, Kec. Semarang Sel., Kota Semarang, Jawa Tengah 50241' }}
        title="LAPORAN POSISI KEUANGAN (NERACA)"
        period={`Per ${MONTHS_LONG[period.month - 1]} ${period.year}`}
      />

      {loading ? (
        <p className="text-sm text-ink-400">Memuat...</p>
      ) : (
        <>
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

          {/* Rincian Debit/Kredit — format neraca saldo, agar terlihat sisi akuntansinya */}
          <div className="mt-8">
            <p className="font-display mb-2 text-sm font-semibold text-ink-900">Rincian Saldo per Akun (Debit / Kredit)</p>
            <div className="overflow-x-auto rounded-xl2 border border-lavender-200 bg-white">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
                    <th className="px-4 py-3 font-medium">Kode</th>
                    <th className="px-4 py-3 font-medium">Nama Akun</th>
                    <th className="px-4 py-3 text-right font-medium">Debit</th>
                    <th className="px-4 py-3 text-right font-medium">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-400">Belum ada mutasi.</td></tr>}
                  {trialBalance.map(r => (
                    <tr key={r.id || r.name} className="border-b border-lavender-50 last:border-0">
                      <td className="px-4 py-2.5 text-ink-400">{r.code}</td>
                      <td className="px-4 py-2.5 text-ink-900">{r.name}</td>
                      <td className="font-mono px-4 py-2.5 text-right text-ink-900">{r.debit > 0 ? fmt(r.debit) : '—'}</td>
                      <td className="font-mono px-4 py-2.5 text-right text-ink-900">{r.credit > 0 ? fmt(r.credit) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-lavender-200 font-semibold text-ink-900">
                    <td className="px-4 py-3" colSpan={2}>Total</td>
                    <td className="font-mono px-4 py-3 text-right">{fmt(totalDebit)}</td>
                    <td className="font-mono px-4 py-3 text-right">{fmt(totalCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

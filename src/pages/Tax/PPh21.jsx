import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'
import { calculatePPh21Monthly } from '../../lib/taxCalc.js'

const fmt = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const PTKP_OPTIONS = ['TK/0','TK/1','TK/2','TK/3','K/0','K/1','K/2','K/3']

export default function PPh21() {
  const { activeEntityId, entities } = useEntity()
  const entityId = activeEntityId || entities[0]?.id
  const [employees, setEmployees] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', npwp: '', ptkp_status: 'TK/0', gross_salary: '' })

  const load = () => {
    if (!entityId) return
    supabase.from('employees').select('*').eq('entity_id', entityId).order('full_name').then(({ data }) => setEmployees(data || []))
  }
  useEffect(load, [entityId])

  const submit = async e => {
    e.preventDefault()
    await supabase.from('employees').insert({ ...form, entity_id: entityId, gross_salary: Number(form.gross_salary) })
    setForm({ full_name: '', npwp: '', ptkp_status: 'TK/0', gross_salary: '' })
    setShowForm(false)
    load()
  }

  const recordFiling = async totalTax => {
    const now = new Date()
    await supabase.from('tax_filings').insert({
      entity_id: entityId, tax_type: 'pph21', period_month: now.getMonth() + 1, period_year: now.getFullYear(), tax_amount: totalTax
    })
    await supabase.rpc('fn_record_tax_liability', {
      p_entity_id: entityId, p_tax_type: 'pph21', p_amount: totalTax, p_entry_date: now.toISOString().slice(0, 10)
    })
    alert('Kewajiban PPh 21 bulan ini tersimpan di Ringkasan Pajak dan Laporan Neraca.')
  }

  const totalTax = employees.reduce((s, emp) => s + calculatePPh21Monthly(Number(emp.gross_salary), emp.ptkp_status).monthlyTax, 0)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <SectionEyebrow>PPh 21 — Pajak Penghasilan Karyawan</SectionEyebrow>
        <button onClick={() => setShowForm(s => !s)} className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90">
          {showForm ? 'Tutup' : '+ Tambah Karyawan'}
        </button>
      </div>

      <p className="mb-4 rounded-xl bg-lavender-50 px-4 py-3 text-xs text-ink-400">
        ⚠ Estimasi memakai metode tahunan disetahunkan. Pemotongan resmi bulanan wajib pakai tabel TER (PMK 168/2023) —
        cocokkan dengan kalkulator resmi DJP atau konsultan pajak sebelum menyetor/lapor SPT Masa.
      </p>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border-2 border-dashed border-lavender-300 bg-white p-4 sm:grid-cols-4">
          <input required placeholder="Nama karyawan" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="rounded-xl border border-lavender-200 px-3 py-2 text-sm" />
          <input placeholder="NPWP (opsional)" value={form.npwp} onChange={e => setForm({ ...form, npwp: e.target.value })} className="rounded-xl border border-lavender-200 px-3 py-2 text-sm" />
          <select value={form.ptkp_status} onChange={e => setForm({ ...form, ptkp_status: e.target.value })} className="rounded-xl border border-lavender-200 px-3 py-2 text-sm">
            {PTKP_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input required type="number" placeholder="Gaji bruto/bulan" value={form.gross_salary} onChange={e => setForm({ ...form, gross_salary: e.target.value })} className="font-mono rounded-xl border border-lavender-200 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-xl bg-ink-900 py-2 text-xs font-medium text-white hover:opacity-90 sm:col-span-4">Simpan Karyawan</button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl2 border border-lavender-200 bg-white">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-lavender-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">PTKP</th>
              <th className="px-4 py-3 text-right font-medium">Gaji Bruto</th>
              <th className="px-4 py-3 text-right font-medium">Estimasi PPh 21/bulan</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-ink-400">Belum ada data karyawan.</td></tr>}
            {employees.map(emp => {
              const calc = calculatePPh21Monthly(Number(emp.gross_salary), emp.ptkp_status)
              return (
                <tr key={emp.id} className="border-b border-lavender-50 last:border-0">
                  <td className="px-4 py-3 text-ink-900">{emp.full_name}</td>
                  <td className="px-4 py-3 text-ink-400">{emp.ptkp_status}</td>
                  <td className="font-mono px-4 py-3 text-right text-ink-400">{fmt(emp.gross_salary)}</td>
                  <td className="font-mono px-4 py-3 text-right font-medium text-ink-900">{fmt(calc.monthlyTax)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {employees.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl2 bg-lavender-100 px-5 py-4">
          <div>
            <p className="text-xs text-ink-400">Total Estimasi PPh 21 Bulan Ini</p>
            <p className="font-mono text-lg font-semibold text-ink-900">{fmt(totalTax)}</p>
          </div>
          <button onClick={() => recordFiling(totalTax)} className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90">
            Catat sebagai Kewajiban Bulan Ini
          </button>
        </div>
      )}
    </div>
  )
}

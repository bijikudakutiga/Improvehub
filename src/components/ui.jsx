import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Section divider bergaya "eyebrow label + garis tipis"
export function SectionEyebrow({ children }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-lavender-500">{children}</span>
      <div className="h-px flex-1 bg-lavender-200" />
    </div>
  )
}

// Angka KPI dengan animasi count-up ringan
export function CountUp({ value, prefix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let frame
    const duration = 700
    const start = performance.now()
    const animate = now => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <span>{prefix}{display.toLocaleString('id-ID', { maximumFractionDigits: decimals })}</span>
}

export function KpiCard({ label, value, prefix = 'Rp ', tone = 'default', sub }) {
  const tones = {
    default: 'bg-white border-lavender-200',
    positive: 'bg-mint/40 border-mint',
    negative: 'bg-blush/40 border-blush'
  }
  return (
    <div className={`rounded-xl2 border p-5 shadow-sm shadow-ink-900/5 ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="font-mono mt-2 text-2xl font-semibold text-ink-900"><CountUp value={value} prefix={prefix} /></p>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  )
}

// Kartu aksi dengan border menarik — dipakai untuk "Input Pemasukan" / "Input Pengeluaran"
export function ActionCard({ to, title, description, tone, icon }) {
  const tones = {
    income: 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100',
    expense: 'border-rose-300 bg-rose-50 hover:bg-rose-100'
  }
  const iconTones = {
    income: 'bg-emerald-500 text-white',
    expense: 'bg-rose-500 text-white'
  }
  return (
    <Link
      to={to}
      className={`led-border group relative overflow-hidden rounded-xl2 border-2 p-5 transition-colors ${tones[tone]}`}
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold ${iconTones[tone]}`}>{icon}</span>
        <span className="text-lavender-400 transition-transform group-hover:translate-x-1">→</span>
      </div>
      <p className="font-display mt-3 text-base font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-xs text-ink-400">{description}</p>
    </Link>
  )
}

// Tombol unduh CSV (bisa dibuka di Excel) + cetak/simpan PDF
// Input angka Rupiah yang aman — user bebas ketik dengan/tanpa titik ribuan,
// tersimpan sebagai angka murni. Menghindari bug input type="number" native
// yang menolak format "50.000.000" (titik dibaca sebagai desimal oleh browser).
export function RupiahInput({ value, onChange, className = '', ...props }) {
  const display = value === '' || value === null || value === undefined || isNaN(value) ? '' : Number(value).toLocaleString('id-ID')
  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
      className={`font-mono ${className}`}
      {...props}
    />
  )
}

// Kop surat laporan — konsisten dipakai di semua laporan (per PT maupun gabungan Group)
export function ReportLetterhead({ entity, title, period }) {
  return (
    <div className="mb-5 rounded-xl2 border border-lavender-200 bg-white p-6 text-center">
      <p className="font-display text-base font-semibold text-ink-900">{entity?.legal_name}</p>
      {entity?.npwp && <p className="font-mono text-xs text-ink-400">NPWP: {entity.npwp}</p>}
      {entity?.address && <p className="text-xs text-ink-400">{entity.address}</p>}
      <p className="mt-2 text-sm font-medium text-lavender-500">{title}</p>
      {period && <p className="text-xs text-ink-400">{period}</p>}
    </div>
  )
}

export function ExportBar({ filename, rows, columns }) {
  const downloadCSV = () => {
    const header = columns.map(c => c.label).join(',')
    const body = rows.map(r => columns.map(c => {
      const val = typeof c.value === 'function' ? c.value(r) : r[c.key]
      return `"${String(val ?? '').replace(/"/g, '""')}"`
    }).join(',')).join('\n')
    const csv = '\uFEFF' + header + '\n' + body
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mb-4 flex gap-2 print:hidden">
      <button onClick={downloadCSV} className="rounded-xl border border-lavender-200 bg-white px-3.5 py-2 text-xs font-medium text-ink-900 hover:bg-lavender-50">
        ⬇ Unduh Excel (CSV)
      </button>
      <button onClick={() => window.print()} className="rounded-xl border border-lavender-200 bg-white px-3.5 py-2 text-xs font-medium text-ink-900 hover:bg-lavender-50">
        🖨 Cetak / Simpan PDF
      </button>
    </div>
  )
}

export function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-lavender-300 bg-white/60 py-24 text-center">
      <span className="star-motif mb-4 h-6 w-6 bg-lavender-300" />
      <p className="font-display text-lg font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-400">Modul ini sedang disiapkan di tahap pengembangan berikutnya.</p>
    </div>
  )
}

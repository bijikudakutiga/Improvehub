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
    income: 'border-mint hover:border-mint hover:shadow-mint/40 from-mint/20',
    expense: 'border-blush hover:border-blush hover:shadow-blush/40 from-blush/20'
  }
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-xl2 border-2 border-dashed bg-gradient-to-br to-white p-5 transition-all hover:border-solid hover:shadow-lg ${tones[tone]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-lavender-400 transition-transform group-hover:translate-x-1">→</span>
      </div>
      <p className="font-display mt-3 text-base font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-xs text-ink-400">{description}</p>
    </Link>
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

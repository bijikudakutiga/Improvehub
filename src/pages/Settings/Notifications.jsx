import { useState, useEffect } from 'react'
import { SectionEyebrow } from '../../components/ui.jsx'

const DEFAULTS = { jatuh_tempo_pajak: true, transaksi_besar: true, laporan_bulanan: false }

export default function Notifications() {
  const [prefs, setPrefs] = useState(DEFAULTS)

  useEffect(() => {
    const saved = localStorage.getItem('improvehub_notif_prefs')
    if (saved) setPrefs(JSON.parse(saved))
  }, [])

  const toggle = key => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    localStorage.setItem('improvehub_notif_prefs', JSON.stringify(next))
  }

  const ITEMS = [
    { key: 'jatuh_tempo_pajak', label: 'Pengingat jatuh tempo pajak', desc: 'Notifikasi H-3 sebelum tenggat lapor/bayar pajak.' },
    { key: 'transaksi_besar', label: 'Transaksi nominal besar', desc: 'Notifikasi saat ada transaksi di atas Rp 10 juta.' },
    { key: 'laporan_bulanan', label: 'Ringkasan laporan bulanan', desc: 'Kirim ringkasan otomatis setiap awal bulan.' }
  ]

  return (
    <div className="max-w-lg">
      <SectionEyebrow>Notifikasi</SectionEyebrow>
      <div className="space-y-3">
        {ITEMS.map(item => (
          <div key={item.key} className="flex items-center justify-between rounded-xl2 border border-lavender-200 bg-white p-4">
            <div>
              <p className="text-sm font-medium text-ink-900">{item.label}</p>
              <p className="text-xs text-ink-400">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`h-6 w-11 shrink-0 rounded-full transition-colors ${prefs[item.key] ? 'bg-emerald-500' : 'bg-lavender-200'}`}
            >
              <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${prefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

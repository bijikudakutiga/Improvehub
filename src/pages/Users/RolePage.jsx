import { SectionEyebrow } from '../../components/ui.jsx'

const ROLES = [
  { name: 'Owner', desc: 'Akses penuh ke semua PT dan semua modul, termasuk mengatur pengguna lain.', color: 'bg-lavender-100 border-lavender-300' },
  { name: 'Admin Keuangan', desc: 'Bisa input & lihat transaksi, laporan, dan pajak — hanya untuk PT yang diizinkan.', color: 'bg-mint/30 border-mint' },
  { name: 'Viewer', desc: 'Hanya bisa melihat laporan, tidak bisa input atau mengubah data.', color: 'bg-sky/30 border-sky' }
]

export default function RolePage() {
  return (
    <div>
      <SectionEyebrow>Role & Izin</SectionEyebrow>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ROLES.map(r => (
          <div key={r.name} className={`rounded-xl2 border-2 p-5 ${r.color}`}>
            <p className="font-display text-sm font-semibold text-ink-900">{r.name}</p>
            <p className="mt-2 text-xs text-ink-400">{r.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-400">Atur role & akses PT tiap pengguna di menu Daftar Pengguna.</p>
    </div>
  )
}

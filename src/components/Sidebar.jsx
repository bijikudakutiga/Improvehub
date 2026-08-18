import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const MENU = [
  { label: 'Dashboard', to: '/', icon: '◆' },
  {
    label: 'Pemasukan & Pengeluaran', icon: '↕',
    children: [
      { label: 'Semua Transaksi', to: '/transaksi' },
      { label: 'Tambah Transaksi', to: '/transaksi/tambah' },
      { label: 'Kategori', to: '/transaksi/kategori' }
    ]
  },
  {
    label: 'Laporan Keuangan', icon: '▤',
    children: [
      { label: 'Neraca', to: '/laporan/neraca' },
      { label: 'Laba Rugi', to: '/laporan/laba-rugi' },
      { label: 'Arus Kas', to: '/laporan/arus-kas' },
      { label: 'Perubahan Ekuitas', to: '/laporan/perubahan-ekuitas' },
      { label: 'Proyeksi', to: '/laporan/proyeksi' },
      { label: 'Rasio Keuangan', to: '/laporan/rasio' }
    ]
  },
  {
    label: 'Perpajakan', icon: '§',
    children: [
      { label: 'Ringkasan Pajak', to: '/pajak' },
      { label: 'PPh Badan (25/29)', to: '/pajak/pph-badan' },
      { label: 'PPh 21', to: '/pajak/pph-21' },
      { label: 'PPh 23/26', to: '/pajak/pph-23-26' },
      { label: 'PPN & e-Faktur', to: '/pajak/ppn' },
      { label: 'Kalender Pajak', to: '/pajak/kalender' },
      { label: 'Lapor Pajak', to: '/pajak/lapor' }
    ]
  },
  {
    label: 'Aset Tetap', icon: '▣',
    children: [
      { label: 'Daftar Aset', to: '/aset' },
      { label: 'Penyusutan', to: '/aset/penyusutan' }
    ]
  },
  {
    label: 'Anggaran', icon: '◫',
    children: [
      { label: 'Anggaran per Kategori', to: '/anggaran' },
      { label: 'Realisasi vs Anggaran', to: '/anggaran/realisasi' }
    ]
  },
  {
    label: 'Entitas Perusahaan', icon: '⬡',
    children: [
      { label: 'PT. Sumber Pengembangan Karya', to: '/entitas/spk' },
      { label: 'PT. FYI Psychology Indonesia', to: '/entitas/fyi' },
      { label: 'I-Global', to: '/entitas/igl' },
      { label: 'Laporan Konsolidasi', to: '/entitas/konsolidasi' }
    ]
  },
  {
    label: 'Pengguna & Akses', icon: '◐',
    children: [
      { label: 'Daftar Pengguna', to: '/pengguna' },
      { label: 'Role & Izin', to: '/pengguna/role' }
    ]
  },
  {
    label: 'Pengaturan', icon: '⚙',
    children: [
      { label: 'Profil Perusahaan', to: '/pengaturan/profil' },
      { label: 'Kategori & Pemetaan Akun', to: '/pengaturan/akun' },
      { label: 'Notifikasi', to: '/pengaturan/notifikasi' },
      { label: 'Tampilan', to: '/pengaturan/tampilan' }
    ]
  }
]

function Section({ item, collapsed }) {
  const [open, setOpen] = useState(false)
  if (!item.children) {
    return (
      <NavLink
        to={item.to}
        end={item.to === '/'}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
            isActive ? 'bg-lavender-100 text-ink-900 font-medium' : 'text-ink-400 hover:bg-lavender-50'
          }`
        }
      >
        <span className="w-4 text-center text-lavender-500">{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    )
  }
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-400 hover:bg-lavender-50"
      >
        <span className="w-4 text-center text-lavender-500">{item.icon}</span>
        {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
        {!collapsed && <span className="text-xs text-lavender-400">{open ? '−' : '+'}</span>}
      </button>
      {open && !collapsed && (
        <div className="ml-7 mt-1 flex flex-col gap-0.5 border-l border-lavender-200 pl-3">
          {item.children.map(c => (
            <NavLink
              key={c.to}
              to={c.to}
              className={({ isActive }) =>
                `rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                  isActive ? 'bg-lavender-100 text-ink-900 font-medium' : 'text-ink-400 hover:bg-lavender-50'
                }`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-ink-900/40 md:hidden" />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-lavender-200 bg-white transition-all duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative
        ${collapsed ? 'w-[76px]' : 'w-[240px] sm:w-[280px]'}`}>
        <div className="flex items-center justify-between border-b border-lavender-100 px-4 py-5">
          {collapsed ? (
            <div className="h-8 w-8 shrink-0 overflow-hidden">
              <img src="/logo.png" alt="IMPROVEHUB" className="h-8 w-auto max-w-none" style={{ objectFit: 'cover', objectPosition: 'left' }} />
            </div>
          ) : (
            <img src="/logo.png" alt="IMPROVEHUB" className="h-8 w-auto" />
          )}
          <button onClick={() => setMobileOpen(false)} className="text-lavender-400 md:hidden">✕</button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {MENU.map(item => <Section key={item.label} item={item} collapsed={collapsed} />)}
        </nav>

        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden border-t border-lavender-100 px-4 py-3 text-left text-xs text-lavender-500 hover:text-ink-900 md:block"
        >
          {collapsed ? '»' : '« Ciutkan menu'}
        </button>
      </aside>
    </>
  )
}

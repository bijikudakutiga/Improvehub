import { useState } from 'react'
import { useEntity } from '../contexts/EntityContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function TopBar({ onOpenMenu }) {
  const { entities, activeEntityId, setActiveEntityId, activeEntity } = useEntity()
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="flex items-center justify-between border-b border-lavender-200 bg-white/80 px-3 py-3 backdrop-blur sm:px-6 sm:py-3.5">
      <div className="flex items-center gap-2">
        <button onClick={onOpenMenu} className="rounded-lg p-1.5 text-ink-900 hover:bg-lavender-50 md:hidden">☰</button>
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 rounded-xl border border-lavender-200 bg-lavender-50 px-3 py-2 text-xs font-medium text-ink-900 transition-colors hover:bg-lavender-100 sm:px-4 sm:text-sm"
          >
            <span className="star-motif h-2.5 w-2.5 bg-lavender-500 shrink-0" />
            <span className="max-w-[140px] truncate sm:max-w-none">{activeEntity?.legal_name}</span>
            <span className="text-lavender-400">▾</span>
          </button>
          {open && (
            <div className="animate-fadeIn absolute left-0 top-12 z-20 w-72 rounded-xl2 border border-lavender-200 bg-white p-2 shadow-lg shadow-ink-900/5">
              <button
                onClick={() => { setActiveEntityId(null); setOpen(false) }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${!activeEntityId ? 'bg-lavender-100 font-medium text-ink-900' : 'hover:bg-lavender-50 text-ink-400'}`}
              >
                IMPROVEHUB Group
                <span className="text-[10px] uppercase tracking-wide text-lavender-400">Gabungan</span>
              </button>
              <div className="my-1 border-t border-lavender-100" />
              {entities.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setActiveEntityId(e.id); setOpen(false) }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${activeEntityId === e.id ? 'bg-lavender-100 font-medium text-ink-900' : 'hover:bg-lavender-50 text-ink-400'}`}
                >
                  {e.legal_name}
                  <span className="text-[10px] uppercase tracking-wide text-lavender-400">{e.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-ink-400 sm:inline">{profile?.full_name || 'Pengguna'}</span>
        <button onClick={signOut} className="rounded-lg border border-lavender-200 px-2.5 py-1.5 text-xs text-ink-400 hover:bg-lavender-50 sm:px-3">
          Keluar
        </button>
      </div>
    </header>
  )
}

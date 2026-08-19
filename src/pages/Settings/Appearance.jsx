import { SectionEyebrow } from '../../components/ui.jsx'
import { useTutorial } from '../../contexts/TutorialContext.jsx'

export default function Appearance() {
  const { start } = useTutorial()
  return (
    <div className="max-w-lg">
      <SectionEyebrow>Tampilan</SectionEyebrow>

      <div className="mb-5 flex items-center justify-between rounded-xl2 border border-lavender-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <img src="/mascot.png" alt="ImproveBot" className="h-12 w-auto" />
          <div>
            <p className="text-sm font-medium text-ink-900">Tutorial Aplikasi</p>
            <p className="text-xs text-ink-400">Putar ulang penjelasan ImproveBot dari awal.</p>
          </div>
        </div>
        <button onClick={start} className="shrink-0 rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:opacity-90">Putar Ulang</button>
      </div>

      <div className="rounded-xl2 border border-lavender-200 bg-white p-5">
        <p className="mb-3 text-sm font-medium text-ink-900">Palet Warna Brand</p>
        <div className="flex gap-2">
          {[
            { name: 'Ink', hex: '#251A3F' },
            { name: 'Lavender', hex: '#9B87C4' },
            { name: 'Mint', hex: '#C9EAD8' },
            { name: 'Peach', hex: '#F6DCC6' },
            { name: 'Blush', hex: '#F3D2DA' },
            { name: 'Sky', hex: '#CFE3F5' }
          ].map(c => (
            <div key={c.name} className="text-center">
              <div className="h-10 w-10 rounded-xl border border-lavender-200" style={{ backgroundColor: c.hex }} />
              <p className="mt-1 text-[10px] text-ink-400">{c.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-400">Palet ini konsisten di semua modul & laporan yang diunduh. Perubahan tema kustom akan tersedia di tahap berikutnya.</p>
      </div>
    </div>
  )
}

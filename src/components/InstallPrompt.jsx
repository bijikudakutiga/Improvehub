import { useEffect, useState } from 'react'

const DISMISS_KEY = 'improvehub_install_dismissed'
const isIOS = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState('android')

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === 'true') return

    if (isIOS()) {
      setPlatform('ios')
      setShow(true)
      return
    }

    const handler = e => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPlatform('android')
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setShow(false)
  }

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    dismiss()
  }

  if (!show) return null

  return (
    <div className="animate-fadeIn fixed inset-x-4 bottom-4 z-50 rounded-xl2 border border-lavender-200 bg-white p-4 shadow-lg shadow-ink-900/10 sm:inset-x-auto sm:right-6 sm:w-80">
      <div className="flex items-start gap-3">
        <img src="/icon-192-v2.png" alt="IMPROVEHUB" className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex-1">
          <p className="font-display text-sm font-semibold text-ink-900">Pasang Aplikasi IMPROVEHUB</p>
          {platform === 'ios' ? (
            <p className="mt-1 text-xs text-ink-400">
              Tap tombol <span className="font-medium">Share</span> di Safari, lalu pilih
              <span className="font-medium"> "Tambahkan ke Layar Utama"</span>.
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink-400">Akses lebih cepat langsung dari layar utama HP Anda.</p>
          )}
        </div>
        <button onClick={dismiss} className="text-lavender-400 hover:text-ink-900">✕</button>
      </div>
      {platform === 'android' && (
        <button onClick={install} className="mt-3 w-full rounded-xl bg-ink-900 py-2 text-xs font-medium text-white hover:opacity-90">
          Pasang Sekarang
        </button>
      )}
    </div>
  )
}

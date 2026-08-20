import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTutorial } from '../contexts/TutorialContext.jsx'

const STEPS = [
  {
    title: 'Halo!',
    text: 'Halo, selamat datang di Improvehub Financial & Tax App! Saya ImproveBot yang diciptakan dari kloningan Mas Yudi, bertugas untuk membantu anda menjelaskan penggunaan aplikasi ini ♥️',
    route: '/', highlight: null
  },
  {
    title: 'Dashboard',
    text: 'Ini Dashboard — halaman pertama yang Anda lihat. Di sini ada ringkasan total pemasukan, pengeluaran, saldo bersih, tren bulanan, dan komposisi pengeluaran. Semuanya dihitung otomatis dari transaksi yang sudah dicatat.',
    route: '/', highlight: 'menu-dashboard'
  },
  {
    title: 'Ganti PT',
    text: 'Tombol yang menyala ini — "IMPROVEHUB Group" — dipakai untuk beralih tampilan. Tap untuk melihat laporan gabungan 3 PT sekaligus, atau pilih satu PT tertentu untuk lihat datanya masing-masing.',
    route: '/', highlight: 'entity-switcher'
  },
  {
    title: 'Input Pemasukan & Pengeluaran',
    text: 'Ini menu Pemasukan & Pengeluaran yang sedang menyala. Cukup pilih PT, kategori, jumlah, dan tanggal — sistem otomatis mencatatnya ke semua laporan terkait, tidak perlu paham debit/kredit.',
    route: '/transaksi/tambah', highlight: 'menu-transaksi'
  },
  {
    title: 'Laporan Keuangan',
    text: 'Menu Laporan Keuangan berisi Neraca (aset, kewajiban, ekuitas), Laba Rugi (untung/rugi), dan Arus Kas (pergerakan uang masuk-keluar). Semuanya update otomatis setiap ada transaksi baru.',
    route: '/laporan/neraca', highlight: 'menu-laporan'
  },
  {
    title: 'Pajak: PPh 21',
    text: 'Menu Perpajakan sedang menyala. PPh 21 adalah pajak penghasilan karyawan — perusahaan wajib memotong sebagian gaji karyawan setiap bulan dan menyetorkannya ke negara. Tambahkan data karyawan di sini untuk hitung otomatis.',
    route: '/pajak/pph-21', highlight: 'menu-pajak'
  },
  {
    title: 'Pajak: PPh 23/26',
    text: 'PPh 23 (2%) dipotong saat perusahaan Anda membayar jasa, sewa, atau royalti ke pihak lain di dalam negeri. PPh 26 (20%) berlaku kalau pembayarannya ke pihak luar negeri.',
    route: '/pajak/pph-23-26', highlight: 'menu-pajak'
  },
  {
    title: 'Pajak: PPN',
    text: 'PPN (Pajak Pertambahan Nilai) dikenakan saat perusahaan menjual barang/jasa (tarif 11%). Selisih PPN yang dipungut dari penjualan dan PPN yang dibayar saat belanja adalah yang harus disetor ke negara.',
    route: '/pajak/ppn', highlight: 'menu-pajak'
  },
  {
    title: 'Pajak: PPh Badan',
    text: 'PPh Badan adalah pajak atas laba perusahaan itu sendiri (tarif 22%). Modul ini mengambil angka Laba Rugi otomatis untuk memberi estimasi.',
    route: '/pajak/pph-badan', highlight: 'menu-pajak'
  },
  {
    title: 'Kalender & Lapor Pajak',
    text: 'Kalender Pajak menunjukkan kapan tiap jenis pajak jatuh tempo. Lapor Pajak merangkum semua kewajiban dalam satu periode, lengkap kop surat, siap diunduh sebagai PDF atau Excel.',
    route: '/pajak/lapor', highlight: 'menu-pajak'
  },
  {
    title: 'Aset Tetap & Anggaran',
    text: 'Menu Aset Tetap yang menyala ini mencatat kendaraan, peralatan, dll — nilainya otomatis menyusut tiap bulan. Menu Anggaran (di bawahnya) biarkan Anda menetapkan target pengeluaran per kategori.',
    route: '/aset', highlight: 'menu-aset'
  },
  {
    title: 'Pengaturan',
    text: 'Di menu Pengaturan yang menyala ini, Anda bisa mengedit NPWP & alamat tiap PT, menambah kategori transaksi baru, dan mengatur notifikasi. Tutorial ini juga bisa diputar ulang kapan saja dari sini.',
    route: '/pengaturan/profil', highlight: 'menu-pengaturan'
  },
  {
    title: 'Selamat Mencoba!',
    text: 'Itu saja perkenalan singkatnya! Kalau ada yang bingung, tanya saja ke Mas Yudi. Selamat mengelola keuangan IMPROVEHUB Group! ✨',
    route: '/', highlight: null
  }
]

export default function Tutorial() {
  const { active, finish, setSpotlight } = useTutorial()
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)
  const intervalRef = useRef(null)

  const step = STEPS[stepIndex]

  // Pindah halaman & nyalakan sorotan sesuai langkah tutorial saat ini
  useEffect(() => {
    if (!active) return
    if (step.route) navigate(step.route)
    setSpotlight(step.highlight || null)
    const scrollTimer = setTimeout(() => {
      if (step.highlight) {
        const el = document.querySelector(`[data-tutorial="${step.highlight}"]`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 250)
    return () => clearTimeout(scrollTimer)
  }, [stepIndex, active])

  useEffect(() => {
    if (!active) return
    setDisplayed('')
    setTyping(true)
    let i = 0
    const text = step.text
    intervalRef.current = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(intervalRef.current)
        setTyping(false)
      }
    }, 18)
    return () => clearInterval(intervalRef.current)
  }, [stepIndex, active])

  useEffect(() => {
    if (!active) { setStepIndex(0); setSpotlight(null) }
  }, [active])

  if (!active) return null

  const handleNext = () => {
    if (typing) {
      clearInterval(intervalRef.current)
      setDisplayed(step.text)
      setTyping(false)
      return
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(i => i + 1)
    } else {
      finish()
    }
  }

  const handleSkip = () => finish()

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-ink-900/45" onClick={handleSkip} />
      <div className="pointer-events-none fixed inset-0 z-[130] flex flex-col items-center justify-end p-4 sm:items-center sm:justify-center">
        <div className="animate-fadeIn pointer-events-auto w-full max-w-md">
          <div className="mb-[-24px] flex justify-center">
            <img src="/mascot.png" alt="ImproveBot" className="h-40 w-auto drop-shadow-xl" />
          </div>
          <div className="rounded-xl2 border-2 border-lavender-300 bg-white p-5 pt-8 shadow-2xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="star-motif h-2.5 w-2.5 bg-lavender-400" />
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-lavender-500">ImproveBot — {step.title}</p>
            </div>
            <p onClick={handleNext} className="min-h-[72px] cursor-pointer text-sm leading-relaxed text-ink-900">
              {displayed}
              {typing && <span className="animate-pulse">▍</span>}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {STEPS.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-4 bg-lavender-500' : 'w-1.5 bg-lavender-200'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleSkip} className="rounded-lg px-3 py-1.5 text-xs text-ink-400 hover:text-ink-900">Lewati</button>
                <button onClick={handleNext} className="rounded-xl bg-ink-900 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90">
                  {typing ? 'Ketik cepat' : stepIndex < STEPS.length - 1 ? 'Lanjut →' : 'Selesai'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

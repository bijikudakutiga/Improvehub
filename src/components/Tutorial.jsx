import { useEffect, useState, useRef } from 'react'
import { useTutorial } from '../contexts/TutorialContext.jsx'

const STEPS = [
  {
    title: 'Halo!',
    text: 'Halo, selamat datang di Improvehub Financial & Tax App! Saya ImproveBot yang diciptakan dari kloningan Mas Yudi, bertugas untuk membantu anda menjelaskan penggunaan aplikasi ini ♥️'
  },
  {
    title: 'Dashboard',
    text: 'Ini Dashboard — halaman pertama yang Anda lihat. Di sini ada ringkasan total pemasukan, pengeluaran, saldo bersih, tren bulanan, dan komposisi pengeluaran. Semuanya dihitung otomatis dari transaksi yang sudah dicatat.'
  },
  {
    title: 'Ganti PT',
    text: 'Di pojok kiri atas ada tombol "IMPROVEHUB Group". Tap itu untuk melihat laporan gabungan 3 PT sekaligus, atau pilih satu PT tertentu — PT. Sumber Pengembangan Karya, PT. FYI Psychology Indonesia, atau I-Global — untuk lihat datanya masing-masing.'
  },
  {
    title: 'Input Pemasukan & Pengeluaran',
    text: 'Pakai kartu "Input Pemasukan" dan "Input Pengeluaran" di Dashboard, atau lewat menu Pemasukan & Pengeluaran di sidebar. Cukup pilih PT, kategori, jumlah, dan tanggal — sistem otomatis mencatatnya ke semua laporan terkait, tidak perlu paham debit/kredit.'
  },
  {
    title: 'Laporan Keuangan',
    text: 'Menu Laporan Keuangan berisi Neraca (aset, kewajiban, ekuitas), Laba Rugi (untung/rugi), dan Arus Kas (pergerakan uang masuk-keluar). Semuanya update otomatis setiap ada transaksi baru — tinggal buka dan lihat, tidak perlu hitung manual.'
  },
  {
    title: 'Pajak: PPh 21',
    text: 'PPh 21 adalah pajak penghasilan karyawan. Perusahaan wajib memotong sebagian gaji karyawan setiap bulan dan menyetorkannya ke negara. Di menu ini, tambahkan data karyawan Anda dan sistem akan menghitung estimasi potongannya otomatis.'
  },
  {
    title: 'Pajak: PPh 23/26',
    text: 'PPh 23 (2%) dipotong saat perusahaan Anda membayar jasa, sewa, atau royalti ke pihak lain di dalam negeri. PPh 26 (20%) berlaku kalau pembayarannya ke pihak luar negeri. Ini juga kewajiban yang harus disetor ke negara.'
  },
  {
    title: 'Pajak: PPN',
    text: 'PPN (Pajak Pertambahan Nilai) dikenakan saat perusahaan menjual barang/jasa (tarif 11%). Selisih antara PPN yang Anda pungut dari penjualan dan PPN yang Anda bayar saat belanja adalah yang harus disetor ke negara — modul ini menghitungnya otomatis dari transaksi bulan berjalan.'
  },
  {
    title: 'Pajak: PPh Badan',
    text: 'PPh Badan adalah pajak atas laba perusahaan itu sendiri (tarif 22%). Modul ini mengambil angka Laba Rugi otomatis untuk memberi estimasi — meski laba fiskal sesungguhnya bisa berbeda, jadi tetap dicek ulang dengan konsultan pajak ya.'
  },
  {
    title: 'Kalender & Lapor Pajak',
    text: 'Kalender Pajak menunjukkan kapan tiap jenis pajak jatuh tempo bulanan/tahunan. Lapor Pajak merangkum semua kewajiban pajak dalam satu periode, lengkap dengan kop surat perusahaan, siap diunduh sebagai PDF atau Excel.'
  },
  {
    title: 'Aset Tetap & Anggaran',
    text: 'Menu Aset Tetap mencatat kendaraan, peralatan, dll — nilainya otomatis menyusut tiap bulan (metode garis lurus). Menu Anggaran biarkan Anda menetapkan target pengeluaran per kategori, lalu bandingkan dengan realisasinya.'
  },
  {
    title: 'Pengaturan',
    text: 'Di menu Pengaturan, Anda bisa mengedit NPWP & alamat tiap PT, menambah kategori transaksi baru, dan mengatur notifikasi. Tutorial ini juga bisa diputar ulang kapan saja dari sini kalau Anda lupa caranya.'
  },
  {
    title: 'Selamat Mencoba!',
    text: 'Itu saja perkenalan singkatnya! Kalau ada yang bingung, tanya saja ke Mas Yudi. Selamat mengelola keuangan IMPROVEHUB Group! ✨'
  }
]

export default function Tutorial() {
  const { active, finish } = useTutorial()
  const [stepIndex, setStepIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)
  const intervalRef = useRef(null)

  const step = STEPS[stepIndex]

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
      setStepIndex(0)
    }
  }

  const handleSkip = () => {
    finish()
    setStepIndex(0)
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end bg-ink-900/50 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="animate-fadeIn w-full max-w-md">
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
            <div className="flex gap-1">
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
  )
}

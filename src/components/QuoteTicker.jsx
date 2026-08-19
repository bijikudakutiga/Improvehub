import { useEffect, useState } from 'react'

const QUOTES = [
  { text: 'Jangan bekerja untuk uang; buatlah uang bekerja untuk Anda.', author: 'Robert Kiyosaki' },
  { text: 'Aset memasukkan uang ke kantong Anda; liabilitas mengeluarkan uang dari kantong Anda.', author: 'Robert Kiyosaki' },
  { text: 'Bukan berapa banyak uang yang Anda hasilkan, tapi berapa banyak yang Anda simpan.', author: 'Robert Kiyosaki' },
  { text: 'Jangan menabung sisa dari belanja, tapi belanjakan sisa dari tabungan.', author: 'Warren Buffett' },
  { text: 'Risiko datang dari tidak tahu apa yang Anda lakukan.', author: 'Warren Buffett' },
  { text: 'Aturan pertama investasi: jangan rugi. Aturan kedua: jangan lupa aturan pertama.', author: 'Warren Buffett' },
  { text: 'Keberanian bukan berarti tidak takut, tapi bertindak meski takut.', author: 'Robert Kiyosaki' },
  { text: 'Kebiasaan finansial yang baik dimulai dari keputusan kecil setiap hari.', author: 'Dave Ramsey' },
  { text: 'Anggaran bukan soal membatasi diri, tapi memberi izin pada diri sendiri untuk mengeluarkan uang dengan percaya diri.', author: 'Dave Ramsey' },
  { text: 'Waktu terbaik menanam pohon adalah 20 tahun lalu. Waktu terbaik kedua adalah sekarang.', author: 'Peribahasa Tiongkok' },
  { text: 'Kekayaan bukan tentang memiliki banyak harta, tapi memiliki banyak pilihan.', author: 'Chris Rock' },
  { text: 'Investasikan pada diri sendiri; itu adalah aset yang tidak bisa diambil siapa pun.', author: 'Warren Buffett' },
  { text: 'Kesempatan datang untuk mereka yang siap secara finansial.', author: 'Robert Kiyosaki' },
  { text: 'Uang adalah alat, bukan tujuan. Gunakan untuk menciptakan kebebasan.', author: 'Tony Robbins' },
  { text: 'Keputusan finansial hari ini menentukan kebebasan Anda di masa depan.', author: 'Suze Orman' },
  { text: 'Disiplin adalah jembatan antara tujuan finansial dan pencapaiannya.', author: 'Jim Rohn' },
  { text: 'Jangan tunggu kaya untuk mulai berinvestasi; berinvestasilah untuk menjadi kaya.', author: 'Robert Kiyosaki' },
  { text: 'Pembukuan yang rapi adalah fondasi dari keputusan bisnis yang tepat.', author: 'Peter Drucker' },
  { text: 'Apa yang diukur, itu yang dikelola.', author: 'Peter Drucker' },
  { text: 'Kesuksesan finansial bukan kebetulan, melainkan hasil dari perencanaan yang konsisten.', author: 'Napoleon Hill' }
]

export default function QuoteTicker() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % QUOTES.length)
        setVisible(true)
      }, 400)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  const q = QUOTES[index]

  return (
    <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-gradient-to-r from-lavender-100 via-white to-lavender-50 px-5 py-3">
      <div className={`flex items-center gap-3 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <span className="star-motif h-3 w-3 shrink-0 bg-lavender-400" />
        <p className="truncate text-xs text-ink-900 sm:text-sm">
          <span className="italic">"{q.text}"</span>
          <span className="ml-2 font-medium text-lavender-500">— {q.author}</span>
        </p>
      </div>
    </div>
  )
}

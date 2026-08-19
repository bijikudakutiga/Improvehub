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

// Digabung jadi satu baris panjang, dipisah bullet, lalu diulang 2x supaya
// animasinya bisa looping mulus tanpa jeda (teknik marquee klasik).
const LINE = QUOTES.map(q => `"${q.text}" — ${q.author}`).join('   •   ')

export default function QuoteTicker() {
  return (
    <div className="overflow-hidden rounded-xl2 border border-lavender-200 bg-gradient-to-r from-lavender-100 via-white to-lavender-50 px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="star-motif h-3 w-3 shrink-0 bg-lavender-400" />
        <div className="relative flex-1 overflow-hidden">
          <div className="quote-marquee flex whitespace-nowrap text-xs text-ink-900 sm:text-sm">
            <span className="pr-10 italic">{LINE}</span>
            <span className="pr-10 italic" aria-hidden="true">{LINE}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

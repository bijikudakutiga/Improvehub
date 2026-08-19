import { SectionEyebrow } from '../../components/ui.jsx'

const DEADLINES = [
  { tax: 'PPh 21', when: 'Tgl 10 bulan berikutnya (bayar), tgl 20 (lapor)', freq: 'Bulanan' },
  { tax: 'PPh 23/26', when: 'Tgl 10 bulan berikutnya (bayar), tgl 20 (lapor)', freq: 'Bulanan' },
  { tax: 'PPN (SPT Masa PPN)', when: 'Akhir bulan berikutnya (bayar & lapor)', freq: 'Bulanan' },
  { tax: 'PPh 25 (Angsuran Badan)', when: 'Tgl 15 bulan berikutnya', freq: 'Bulanan' },
  { tax: 'SPT Tahunan Badan (1771)', when: '30 April tahun berikutnya', freq: 'Tahunan' },
  { tax: 'PPh 29 (Kurang Bayar Tahunan)', when: 'Sebelum SPT Tahunan disampaikan', freq: 'Tahunan' }
]

export default function TaxCalendar() {
  return (
    <div>
      <SectionEyebrow>Kalender Pajak</SectionEyebrow>
      <p className="mb-4 text-xs text-ink-400">Jadwal umum berdasarkan ketentuan yang berlaku. Tanggal bisa mundur ke hari kerja berikutnya jika jatuh di libur/akhir pekan — cek DJP Online untuk kepastian.</p>
      <div className="space-y-3">
        {DEADLINES.map(d => (
          <div key={d.tax} className="flex items-center justify-between rounded-xl2 border border-lavender-200 bg-white p-4">
            <div>
              <p className="text-sm font-medium text-ink-900">{d.tax}</p>
              <p className="text-xs text-ink-400">{d.when}</p>
            </div>
            <span className="rounded-full bg-lavender-100 px-3 py-1 text-[11px] font-medium text-lavender-500">{d.freq}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

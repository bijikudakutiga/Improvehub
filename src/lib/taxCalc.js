// Kalkulasi pajak di file ini adalah ESTIMASI untuk bantu perencanaan internal.
// PPh 21 bulanan resmi wajib pakai metode TER (PMK 168/2023) — di sini dipakai
// metode tahunan disetahunkan sebagai pendekatan. Selalu verifikasi ke kalkulator
// resmi DJP / konsultan pajak sebelum menyetor atau melapor SPT.

const PTKP_ANNUAL = {
  'TK/0': 54_000_000, 'TK/1': 58_500_000, 'TK/2': 63_000_000, 'TK/3': 67_500_000,
  'K/0': 58_500_000, 'K/1': 63_000_000, 'K/2': 67_500_000, 'K/3': 72_000_000
}

export function calculatePPh21Monthly(grossMonthlySalary, ptkpStatus) {
  const annualGross = grossMonthlySalary * 12
  const biayaJabatan = Math.min(annualGross * 0.05, 6_000_000)
  const ptkp = PTKP_ANNUAL[ptkpStatus] || PTKP_ANNUAL['TK/0']
  const pkp = Math.max(0, Math.round((annualGross - biayaJabatan - ptkp) / 1000) * 1000)

  const brackets = [
    { limit: 60_000_000, rate: 0.05 },
    { limit: 250_000_000, rate: 0.15 },
    { limit: 500_000_000, rate: 0.25 },
    { limit: 5_000_000_000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 }
  ]
  let remaining = pkp, annualTax = 0, prevLimit = 0
  for (const b of brackets) {
    const taxableInBracket = Math.max(0, Math.min(remaining, b.limit - prevLimit))
    annualTax += taxableInBracket * b.rate
    remaining -= taxableInBracket
    prevLimit = b.limit
    if (remaining <= 0) break
  }
  return { pkp, annualTax, monthlyTax: annualTax / 12 }
}

export const calculatePPh23 = grossAmount => grossAmount * 0.02
export const calculatePPN = dpp => dpp * 0.11 // tarif efektif barang/jasa non-mewah, 2026
export const PPH_BADAN_RATE = 0.22

// PPh Badan dengan fasilitas Pasal 31E UU PPh: diskon 50% dari tarif umum (jadi ~11%)
// untuk bagian penghasilan kena pajak dari peredaran bruto sampai Rp4,8 miliar,
// berlaku bagi WP Badan (termasuk PT) dengan omzet setahun ≤ Rp50 miliar.
// Catatan: sejak PP 20/2026, PT sudah TIDAK bisa pakai skema Final 0,5% (PP 23/2018/PP 55/2022) —
// itu sekarang khusus WP orang pribadi, perseroan perorangan 1 pemilik, dan koperasi.
export function calculatePPhBadan(pkp, peredaranBruto) {
  const pkpSafe = Math.max(0, pkp)
  const omzetSafe = Math.max(0, peredaranBruto)

  if (omzetSafe > 50_000_000_000) {
    // Tidak dapat fasilitas — tarif umum penuh
    return { pkpDiskon: 0, pkpNormal: pkpSafe, tax: pkpSafe * PPH_BADAN_RATE, eligible: false }
  }

  const batasFasilitas = 4_800_000_000
  const proporsiFasilitas = omzetSafe > 0 ? Math.min(1, batasFasilitas / omzetSafe) : 1
  const pkpDiskon = pkpSafe * proporsiFasilitas
  const pkpNormal = pkpSafe - pkpDiskon
  const tax = pkpDiskon * (PPH_BADAN_RATE * 0.5) + pkpNormal * PPH_BADAN_RATE

  return { pkpDiskon, pkpNormal, tax, eligible: true }
}

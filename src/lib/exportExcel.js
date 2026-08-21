import * as XLSX from 'xlsx'

const fmt = n => n === undefined || n === null || n === '' ? '' : `Rp ${Number(n).toLocaleString('id-ID')}`

function buildLetterheadRows(entity, title, period) {
  const rows = []
  rows.push([entity?.legal_name || ''])
  if (entity?.npwp) rows.push([`NPWP: ${entity.npwp}`])
  if (entity?.address) rows.push([entity.address])
  rows.push([title])
  if (period) rows.push([period])
  rows.push([])
  return rows
}

function download(wb, filename) {
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

function baseSheet(aoa) {
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 38 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]
  return ws
}

// ==================== NERACA ====================
export function exportNeracaExcel({ entity, title, period, aset, kewajiban, ekuitas, totalAset, totalKE, trialBalance, totalDebit, totalCredit }) {
  const rows = buildLetterheadRows(entity, title, period)

  rows.push(['ASET'])
  rows.push(['Kode', 'Nama Akun', 'Jumlah'])
  aset.forEach(a => rows.push([a.code, a.name, fmt(Math.abs(a.balance))]))
  rows.push(['', 'Total Aset', fmt(totalAset)])
  rows.push([])

  rows.push(['KEWAJIBAN'])
  rows.push(['Kode', 'Nama Akun', 'Jumlah'])
  kewajiban.forEach(a => rows.push([a.code, a.name, fmt(Math.abs(a.balance))]))
  rows.push([])

  rows.push(['EKUITAS'])
  rows.push(['Kode', 'Nama Akun', 'Jumlah'])
  ekuitas.forEach(a => rows.push([a.code, a.name, fmt(Math.abs(a.balance))]))
  rows.push(['', 'Total Kewajiban + Ekuitas', fmt(totalKE)])
  rows.push([])

  rows.push(['RINCIAN SALDO PER AKUN (DEBIT / KREDIT)'])
  rows.push(['Kode', 'Nama Akun', 'Debit', 'Kredit'])
  trialBalance.forEach(r => rows.push([r.code, r.name, r.debit > 0 ? fmt(r.debit) : '', r.credit > 0 ? fmt(r.credit) : '']))
  rows.push(['', 'Total', fmt(totalDebit), fmt(totalCredit)])

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, baseSheet(rows), 'Neraca')
  download(wb, `neraca-${entity?.code || 'group'}`)
}

// ==================== LABA RUGI ====================
export function exportLabaRugiExcel({ entity, title, pendapatan, beban, totalPendapatan, totalBeban, labaBersih }) {
  const rows = buildLetterheadRows(entity, title)

  rows.push(['PENDAPATAN'])
  rows.push(['Nama Akun', 'Jumlah'])
  pendapatan.forEach(a => rows.push([a.name, fmt(a.balance)]))
  rows.push(['Total Pendapatan', fmt(totalPendapatan)])
  rows.push([])

  rows.push(['BEBAN'])
  rows.push(['Nama Akun', 'Jumlah'])
  beban.forEach(a => rows.push([a.name, fmt(a.balance)]))
  rows.push(['Total Beban', fmt(totalBeban)])
  rows.push([])

  rows.push([labaBersih >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH', fmt(Math.abs(labaBersih))])

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, baseSheet(rows), 'Laba Rugi')
  download(wb, `laba-rugi-${entity?.code || 'group'}`)
}

// ==================== GENERIK (dipakai laporan lain via ExportBar) ====================
export function exportGenericExcel(filename, rows, columns) {
  const header = columns.map(c => c.label)
  const body = rows.map(r => columns.map(c => {
    const val = typeof c.value === 'function' ? c.value(r) : r[c.key]
    return val === undefined || val === null ? '' : val
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, baseSheet([header, ...body]), 'Laporan')
  download(wb, filename)
}

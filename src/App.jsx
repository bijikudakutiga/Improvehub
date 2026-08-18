import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TransactionList from './pages/Transactions/TransactionList.jsx'
import AddTransaction from './pages/Transactions/AddTransaction.jsx'
import Categories from './pages/Transactions/Categories.jsx'
import Neraca from './pages/Reports/Neraca.jsx'
import LabaRugi from './pages/Reports/LabaRugi.jsx'
import { ComingSoon } from './components/ui.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/transaksi" element={<TransactionList />} />
        <Route path="/transaksi/tambah" element={<AddTransaction />} />
        <Route path="/transaksi/kategori" element={<Categories />} />

        <Route path="/laporan/neraca" element={<Neraca />} />
        <Route path="/laporan/laba-rugi" element={<LabaRugi />} />
        <Route path="/laporan/arus-kas" element={<ComingSoon title="Laporan Arus Kas" />} />
        <Route path="/laporan/perubahan-ekuitas" element={<ComingSoon title="Laporan Perubahan Ekuitas" />} />
        <Route path="/laporan/proyeksi" element={<ComingSoon title="Proyeksi Keuangan" />} />
        <Route path="/laporan/rasio" element={<ComingSoon title="Rasio Keuangan" />} />

        <Route path="/pajak" element={<ComingSoon title="Ringkasan Pajak" />} />
        <Route path="/pajak/pph-badan" element={<ComingSoon title="PPh Badan (25/29)" />} />
        <Route path="/pajak/pph-21" element={<ComingSoon title="PPh 21" />} />
        <Route path="/pajak/pph-23-26" element={<ComingSoon title="PPh 23/26" />} />
        <Route path="/pajak/ppn" element={<ComingSoon title="PPN & e-Faktur" />} />
        <Route path="/pajak/kalender" element={<ComingSoon title="Kalender Pajak" />} />
        <Route path="/pajak/lapor" element={<ComingSoon title="Lapor Pajak" />} />

        <Route path="/aset" element={<ComingSoon title="Daftar Aset Tetap" />} />
        <Route path="/aset/penyusutan" element={<ComingSoon title="Penyusutan Aset" />} />

        <Route path="/anggaran" element={<ComingSoon title="Anggaran per Kategori" />} />
        <Route path="/anggaran/realisasi" element={<ComingSoon title="Realisasi vs Anggaran" />} />

        <Route path="/entitas/spk" element={<ComingSoon title="PT. Sumber Pengembangan Karya" />} />
        <Route path="/entitas/fyi" element={<ComingSoon title="PT. FYI Psychology Indonesia" />} />
        <Route path="/entitas/igl" element={<ComingSoon title="I-Global" />} />
        <Route path="/entitas/konsolidasi" element={<ComingSoon title="Laporan Konsolidasi" />} />

        <Route path="/pengguna" element={<ComingSoon title="Daftar Pengguna" />} />
        <Route path="/pengguna/role" element={<ComingSoon title="Role & Izin" />} />

        <Route path="/pengaturan/profil" element={<ComingSoon title="Profil Perusahaan" />} />
        <Route path="/pengaturan/akun" element={<ComingSoon title="Kategori & Pemetaan Akun" />} />
        <Route path="/pengaturan/notifikasi" element={<ComingSoon title="Notifikasi" />} />
        <Route path="/pengaturan/tampilan" element={<ComingSoon title="Tampilan" />} />
      </Route>
    </Routes>
  )
}

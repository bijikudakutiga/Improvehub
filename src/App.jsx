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
import ArusKas from './pages/Reports/ArusKas.jsx'

import AssetList from './pages/Assets/AssetList.jsx'
import Depreciation from './pages/Assets/Depreciation.jsx'

import Budget from './pages/Budget/Budget.jsx'
import BudgetRealization from './pages/Budget/BudgetRealization.jsx'

import TaxSummary from './pages/Tax/TaxSummary.jsx'
import PPh21 from './pages/Tax/PPh21.jsx'
import PPh23 from './pages/Tax/PPh23.jsx'
import PPN from './pages/Tax/PPN.jsx'
import PPhBadan from './pages/Tax/PPhBadan.jsx'
import TaxCalendar from './pages/Tax/TaxCalendar.jsx'
import LaporPajak from './pages/Tax/LaporPajak.jsx'

import EntityDetail from './pages/Entities/EntityDetail.jsx'
import Consolidated from './pages/Entities/Consolidated.jsx'

import UserList from './pages/Users/UserList.jsx'
import RolePage from './pages/Users/RolePage.jsx'

import CompanyProfile from './pages/Settings/CompanyProfile.jsx'
import CapitalEntries from './pages/Settings/CapitalEntries.jsx'
import CategorySettings from './pages/Settings/CategorySettings.jsx'
import Notifications from './pages/Settings/Notifications.jsx'
import Appearance from './pages/Settings/Appearance.jsx'

import { ComingSoon } from './components/ui.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/transaksi" element={<TransactionList />} />
        <Route path="/transaksi/tambah" element={<AddTransaction />} />
        <Route path="/transaksi/edit/:id" element={<AddTransaction />} />
        <Route path="/transaksi/kategori" element={<Categories />} />

        <Route path="/laporan/neraca" element={<Neraca />} />
        <Route path="/laporan/laba-rugi" element={<LabaRugi />} />
        <Route path="/laporan/arus-kas" element={<ArusKas />} />
        <Route path="/laporan/perubahan-ekuitas" element={<ComingSoon title="Laporan Perubahan Ekuitas" />} />
        <Route path="/laporan/proyeksi" element={<ComingSoon title="Proyeksi Keuangan" />} />
        <Route path="/laporan/rasio" element={<ComingSoon title="Rasio Keuangan" />} />

        <Route path="/pajak" element={<TaxSummary />} />
        <Route path="/pajak/pph-badan" element={<PPhBadan />} />
        <Route path="/pajak/pph-21" element={<PPh21 />} />
        <Route path="/pajak/pph-23-26" element={<PPh23 />} />
        <Route path="/pajak/ppn" element={<PPN />} />
        <Route path="/pajak/kalender" element={<TaxCalendar />} />
        <Route path="/pajak/lapor" element={<LaporPajak />} />

        <Route path="/aset" element={<AssetList />} />
        <Route path="/aset/penyusutan" element={<Depreciation />} />

        <Route path="/anggaran" element={<Budget />} />
        <Route path="/anggaran/realisasi" element={<BudgetRealization />} />

        <Route path="/entitas/spk" element={<EntityDetail code="SPK" />} />
        <Route path="/entitas/fyi" element={<EntityDetail code="FYI" />} />
        <Route path="/entitas/igl" element={<EntityDetail code="IGL" />} />
        <Route path="/entitas/konsolidasi" element={<Consolidated />} />

        <Route path="/pengguna" element={<UserList />} />
        <Route path="/pengguna/role" element={<RolePage />} />

        <Route path="/pengaturan/profil" element={<CompanyProfile />} />
        <Route path="/pengaturan/modal" element={<CapitalEntries />} />
        <Route path="/pengaturan/akun" element={<CategorySettings />} />
        <Route path="/pengaturan/notifikasi" element={<Notifications />} />
        <Route path="/pengaturan/tampilan" element={<Appearance />} />
      </Route>
    </Routes>
  )
}

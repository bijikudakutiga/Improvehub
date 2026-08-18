import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

export default function Categories() {
  const { activeEntityId, entities } = useEntity()
  const [cats, setCats] = useState([])
  const entityId = activeEntityId || entities[0]?.id

  useEffect(() => {
    if (!entityId) return
    supabase.from('categories').select('*').eq('entity_id', entityId).order('kind')
      .then(({ data }) => setCats(data || []))
  }, [entityId])

  const income = cats.filter(c => c.kind === 'pemasukan')
  const expense = cats.filter(c => c.kind === 'pengeluaran')

  return (
    <div>
      <SectionEyebrow>Kategori Transaksi</SectionEyebrow>
      {!activeEntityId && <p className="mb-4 text-xs text-ink-400">Menampilkan kategori dari PT pertama — pilih PT tertentu di atas untuk mengelola kategori masing-masing.</p>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl2 border border-mint bg-mint/10 p-5">
          <p className="font-display mb-3 text-sm font-semibold text-ink-900">Kategori Pemasukan</p>
          <ul className="space-y-2">
            {income.map(c => <li key={c.id} className="rounded-lg bg-white px-3 py-2 text-sm text-ink-900">{c.name}</li>)}
            {income.length === 0 && <p className="text-xs text-ink-400">Belum ada kategori.</p>}
          </ul>
        </div>
        <div className="rounded-xl2 border border-blush bg-blush/10 p-5">
          <p className="font-display mb-3 text-sm font-semibold text-ink-900">Kategori Pengeluaran</p>
          <ul className="space-y-2">
            {expense.map(c => <li key={c.id} className="rounded-lg bg-white px-3 py-2 text-sm text-ink-900">{c.name}</li>)}
            {expense.length === 0 && <p className="text-xs text-ink-400">Belum ada kategori.</p>}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-400">Kelola & tambah kategori baru dari menu Pengaturan → Kategori & Pemetaan Akun (menyusul di tahap berikutnya).</p>
    </div>
  )
}

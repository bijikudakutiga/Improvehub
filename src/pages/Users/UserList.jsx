import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useEntity } from '../../contexts/EntityContext.jsx'
import { SectionEyebrow } from '../../components/ui.jsx'

const ROLE_LABEL = { owner: 'Owner (akses penuh)', admin_keuangan: 'Admin Keuangan', viewer: 'Viewer (baca saja)' }

export default function UserList() {
  const { entities } = useEntity()
  const [users, setUsers] = useState([])

  const load = () => supabase.from('user_profiles').select('*').then(({ data }) => setUsers(data || []))
  useEffect(load, [])

  const updateRole = async (id, role) => {
    await supabase.from('user_profiles').update({ role }).eq('id', id)
    load()
  }

  const toggleEntity = async (user, entityId) => {
    const current = user.entity_access || []
    const next = current.includes(entityId) ? current.filter(e => e !== entityId) : [...current, entityId]
    await supabase.from('user_profiles').update({ entity_access: next }).eq('id', user.id)
    load()
  }

  return (
    <div>
      <SectionEyebrow>Daftar Pengguna</SectionEyebrow>
      <p className="mb-4 text-xs text-ink-400">
        Untuk menambah pengguna baru, buat akunnya dulu lewat Supabase → Authentication → Users → Add user.
        Setelah itu, akun tersebut otomatis muncul di sini untuk diatur role & akses PT-nya.
      </p>

      <div className="space-y-3">
        {users.length === 0 && <p className="rounded-xl2 border border-dashed border-lavender-300 bg-white/60 py-10 text-center text-sm text-ink-400">Belum ada pengguna terdaftar.</p>}
        {users.map(u => (
          <div key={u.id} className="rounded-xl2 border border-lavender-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink-900">{u.full_name || u.id.slice(0, 8)}</p>
                <p className="text-xs text-ink-400">{ROLE_LABEL[u.role]}</p>
              </div>
              <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} className="rounded-xl border border-lavender-200 px-3 py-1.5 text-xs">
                <option value="owner">Owner</option>
                <option value="admin_keuangan">Admin Keuangan</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            {u.role !== 'owner' && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-lavender-100 pt-3">
                <span className="text-xs text-ink-400">Akses PT:</span>
                {entities.map(e => (
                  <button key={e.id} onClick={() => toggleEntity(u, e.id)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${(u.entity_access || []).includes(e.id) ? 'bg-lavender-400 text-white' : 'bg-lavender-50 text-ink-400'}`}>
                    {e.code}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

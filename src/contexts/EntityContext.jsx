import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const EntityContext = createContext(null)

// entity_id = null berarti "Improvehub Group" (gabungan seluruh 3 PT)
export function EntityProvider({ children }) {
  const [entities, setEntities] = useState([])
  const [activeEntityId, setActiveEntityId] = useState(null) // null = Group
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const fetchEntities = () => {
    setLoading(true)
    setLoadError('')
    const priority = { SPK: 1, FYI: 2, IGL: 3 }
    supabase.from('entities').select('*').then(({ data, error }) => {
      if (error) setLoadError(error.message)
      else setEntities((data || []).sort((a, b) => (priority[a.code] || 99) - (priority[b.code] || 99)))
      setLoading(false)
    })
  }

  useEffect(fetchEntities, [])

  const activeEntity = activeEntityId
    ? entities.find(e => e.id === activeEntityId)
    : { id: null, code: 'GROUP', legal_name: 'IMPROVEHUB', address: 'Jl. Singosari I No.27, Pleburan, Kec. Semarang Sel., Kota Semarang, Jawa Tengah 50241' }

  return (
    <EntityContext.Provider value={{ entities, activeEntityId, setActiveEntityId, activeEntity, loading, loadError, retry: fetchEntities }}>
      {children}
    </EntityContext.Provider>
  )
}

export const useEntity = () => useContext(EntityContext)

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
    supabase.from('entities').select('*').order('legal_name').then(({ data, error }) => {
      if (error) setLoadError(error.message)
      else setEntities(data || [])
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

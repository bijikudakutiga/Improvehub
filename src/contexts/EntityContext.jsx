import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const EntityContext = createContext(null)

// entity_id = null berarti "Improvehub Group" (gabungan seluruh 3 PT)
export function EntityProvider({ children }) {
  const [entities, setEntities] = useState([])
  const [activeEntityId, setActiveEntityId] = useState(null) // null = Group
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('entities').select('*').order('legal_name').then(({ data, error }) => {
      if (!error) setEntities(data || [])
      setLoading(false)
    })
  }, [])

  const activeEntity = activeEntityId
    ? entities.find(e => e.id === activeEntityId)
    : { id: null, code: 'GROUP', legal_name: 'IMPROVEHUB Group', address: null }

  return (
    <EntityContext.Provider value={{ entities, activeEntityId, setActiveEntityId, activeEntity, loading }}>
      {children}
    </EntityContext.Provider>
  )
}

export const useEntity = () => useContext(EntityContext)

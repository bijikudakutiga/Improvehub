import { createContext, useContext, useEffect, useState } from 'react'

const SEEN_KEY = 'improvehub_tutorial_seen'
const TutorialContext = createContext(null)

export function TutorialProvider({ children }) {
  const [active, setActive] = useState(false)
  const [spotlight, setSpotlight] = useState(null) // key elemen yang sedang disorot, mis. 'menu-pajak'

  useEffect(() => {
    if (!localStorage.getItem(SEEN_KEY)) {
      const t = setTimeout(() => setActive(true), 500)
      return () => clearTimeout(t)
    }
  }, [])

  const start = () => setActive(true)
  const finish = () => {
    localStorage.setItem(SEEN_KEY, 'true')
    setActive(false)
    setSpotlight(null)
  }

  return (
    <TutorialContext.Provider value={{ active, start, finish, spotlight, setSpotlight }}>
      {children}
    </TutorialContext.Provider>
  )
}

export const useTutorial = () => useContext(TutorialContext)

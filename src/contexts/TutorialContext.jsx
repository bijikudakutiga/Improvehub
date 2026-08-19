import { createContext, useContext, useEffect, useState } from 'react'

const SEEN_KEY = 'improvehub_tutorial_seen'
const TutorialContext = createContext(null)

export function TutorialProvider({ children }) {
  const [active, setActive] = useState(false)

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
  }

  return (
    <TutorialContext.Provider value={{ active, start, finish }}>
      {children}
    </TutorialContext.Provider>
  )
}

export const useTutorial = () => useContext(TutorialContext)

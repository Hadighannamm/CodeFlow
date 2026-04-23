import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type NavContextType = {
  isNavOpen: boolean
  toggleNav: () => void
  closeNav: () => void
}

const NavContext = createContext<NavContextType | undefined>(undefined)

export const NavProvider = ({ children }: { children: ReactNode }) => {
  const [isNavOpen, setIsNavOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth > 768
  })

  const toggleNav = () => setIsNavOpen((prev) => !prev)
  const closeNav = () => {
    if (window.innerWidth <= 768) {
      setIsNavOpen(false)
    }
  }

  return (
    <NavContext.Provider value={{ isNavOpen, toggleNav, closeNav }}>
      {children}
    </NavContext.Provider>
  )
}

export const useNav = () => {
  const context = useContext(NavContext)
  if (!context) {
    throw new Error('useNav must be used within NavProvider')
  }
  return context
}

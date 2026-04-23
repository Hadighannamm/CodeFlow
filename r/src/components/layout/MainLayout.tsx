import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import ToastContainer from './ToastContainer'
import { useState } from 'react'

export default function MainLayout() {
  const [isNavOpen, setIsNavOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth > 768
  })

  const handleToggleNav = () => setIsNavOpen((prev) => !prev)
  const handleCloseNav = () => {
    if (window.innerWidth <= 768) {
      setIsNavOpen(false)
    }
  }

  return (
    <div className="main-layout">
      <Header isNavOpen={isNavOpen} onToggleNav={handleToggleNav} />
      <div className="main-layout-content">
        <Navigation isOpen={isNavOpen} onNavigate={handleCloseNav} />
        <main className="main-layout-main">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import ToastContainer from './ToastContainer'
import { NavProvider } from '../../context/NavContext'

export default function MainLayout() {
  return (
    <NavProvider>
      <div className="main-layout">
        <Header />
        <div className="main-layout-content">
          <Navigation />
          <main className="main-layout-main">
            <Outlet />
          </main>
        </div>
        <ToastContainer />
      </div>
    </NavProvider>
  )
}

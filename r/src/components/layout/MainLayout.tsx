import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <div className="main-layout-content">
        <Navigation />
        <main className="main-layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

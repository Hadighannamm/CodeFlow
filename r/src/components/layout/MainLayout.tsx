import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

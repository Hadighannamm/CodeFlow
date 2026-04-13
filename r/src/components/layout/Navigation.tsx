import { Link, useLocation } from 'react-router-dom'
import { Home, Tag, Bookmark, Plus } from 'lucide-react'
import clsx from 'clsx'

export default function Navigation() {
  const location = useLocation()

  const links = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Tag },
    { path: '/favourites', label: 'Saved', icon: Bookmark },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-20">
      <div className="p-4 space-y-2">
        <Link to="/ask" className="btn-primary w-full flex items-center justify-center gap-2">
          <Plus size={20} />
          Ask Question
        </Link>

        <div className="pt-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            )
          })}
        </div>

        <hr className="my-4" />

        <div className="pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase px-4 mb-2">
            Tags
          </h3>
          <Link
            to="/tags"
            className="block px-4 py-2 text-gray-600 hover:text-blue-600 text-sm"
          >
            View All Tags →
          </Link>
        </div>
      </div>
    </nav>
  )
}

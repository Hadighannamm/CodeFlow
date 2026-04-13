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
    <nav className="navigation">
      <div className="navigation-list" style={{ display: 'flex', flexDirection: 'column' }}>
        <Link to="/ask" className="navigation-ask-button">
          <Plus size={20} />
          Ask Question
        </Link>

        <div style={{ paddingTop: '1rem' }}>
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  'navigation-link',
                  isActive(link.path) && 'active'
                )}
              >
                <Icon size={20} style={{ display: 'inline-block', marginRight: '0.75rem' }} />
                {link.label}
              </Link>
            )
          })}
        </div>

        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

        <div style={{ paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', paddingLeft: '1.5rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
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

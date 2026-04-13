import { Link } from 'react-router-dom'
import { Search, LogOut } from 'lucide-react'

export default function Header() {
  // TODO: Add auth context for user info and logout
  const isAuthenticated = false

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            CF
          </div>
          <span className="text-xl font-bold text-gray-900">CodeFlow</span>
        </Link>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              className="input pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <button className="text-red-500 hover:text-red-700">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link to="/auth" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

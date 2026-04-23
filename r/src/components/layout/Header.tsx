import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, LogOut, User, Shield, Menu, X } from 'lucide-react'
import { useAuth } from '../../customHooks/useAuth'
import { profileService } from '../../services/profileService'
import { useState, useEffect } from 'react'

type HeaderProps = {
  isNavOpen: boolean
  onToggleNav: () => void
}

export default function Header({ isNavOpen, onToggleNav }: HeaderProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = !!user
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState<string>('')

  // Fetch user avatar when user changes
  useEffect(() => {
    if (!user?.id) return

    const fetchAvatar = async () => {
      const { data } = await profileService.getUserProfile(user.id)
      if (data?.avatarUrl) {
        // Add cache buster to force image reload
        const cacheBustUrl = `${data.avatarUrl}?t=${Date.now()}`
        setAvatarUrl(cacheBustUrl)
      } else {
        setAvatarUrl(null)
      }
    }

    // Fetch immediately
    fetchAvatar()

    // Refetch avatar every 1 second to catch updates from profile page
    const interval = setInterval(fetchAvatar, 1000)
    return () => clearInterval(interval)
  }, [user?.id])

  // Load search from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const searchQuery = params.get('search') || ''
    setSearchInput(searchQuery)
  }, [location.search])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    
    // Update URL with search query
    if (value.trim()) {
      navigate(`/?search=${encodeURIComponent(value)}`)
    } else {
      navigate('/')
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <header className="header">
      <div className="header-container">
        

        <Link to="/" className="header-logo-link">
        <button
          type="button"
          className="header-menu-btn"
          onClick={onToggleNav}
          aria-label={isNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isNavOpen}
        >
          {isNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
          <div className="header-logo-icon">
            CF
          </div>
          <span className="header-logo-text">CodeFlow</span>
        </Link>

        <div className="header-search-container">
          <div className="header-search-wrapper">
            <Search className="header-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              className="header-search-input"
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="header-profile-avatar"
                title={user?.email ?? 'Profile'}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="header-avatar-image" />
                ) : (
                  <div className="header-avatar-default">
                    <User size={20} />
                  </div>
                )}
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="header-admin-btn"
                  title="Admin Dashboard"
                >
                  <Shield size={20} />
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="header-logout-btn"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="header-auth-links">
              <Link to="/auth" className="header-auth-link">
                Login
              </Link>
              <Link to="/auth" className="btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

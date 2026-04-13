import { Link, useNavigate } from 'react-router-dom'
import { Search, LogOut, User } from 'lucide-react'
import { useAuth } from '../../customHooks/useAuth'
import { profileService } from '../../services/profileService'
import { useState, useEffect } from 'react'

export default function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const isAuthenticated = !!user
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Fetch user avatar when user changes
  useEffect(() => {
    if (!user?.id) return

    const fetchAvatar = async () => {
      const { data } = await profileService.getUserProfile(user.id)
      if (data?.avatarUrl) {
        setAvatarUrl(data.avatarUrl)
      }
    }

    fetchAvatar()
  }, [user?.id])

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo-link">
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

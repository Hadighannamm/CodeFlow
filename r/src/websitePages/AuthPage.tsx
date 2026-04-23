import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/forms/AuthForm'
import { useAuth } from '../customHooks/useAuth'
import { useToast } from '../customHooks/useToast'
import '../styles/pages/AuthPage.css'

export default function AuthPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, loading, error, successMessage, signUp, signIn } = useAuth()

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error]) // Removed toast from dependencies since it's stable

  // Show success toast when successMessage changes
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage)
      setTimeout(() => navigate('/'), 2000)
    }
  }, [successMessage, navigate]) // Removed toast from dependencies since it's stable

  const handleSignUp = async (email: string, password: string, firstName: string = '', lastName: string = ''): Promise<boolean> => {
    const success = await signUp(email, password, firstName, lastName)
    return success
  }

  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    const success = await signIn(email, password)
    return success
  }

  if (user) {
    return (
      <div className="auth-page-bg">
        <div className="auth-page-container">
          <div className="auth-page-card">
            <div className="auth-page-already-logged">
              <h1>Already Logged In</h1>
              <p>{user.email}</p>
              <button
                onClick={() => navigate('/')}
                className="auth-page-btn"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page-bg">
      <div className="auth-page-container">
        <div className="auth-page-card">
          {/* Logo */}
          <div className="auth-page-header">
            <div className="auth-page-logo">
              CF
            </div>
            <h1 className="auth-page-title">CodeFlow</h1>
            <p className="auth-page-subtitle">Join the community and share your knowledge</p>
          </div>

          <AuthForm
            onSignUp={handleSignUp}
            onSignIn={handleSignIn}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

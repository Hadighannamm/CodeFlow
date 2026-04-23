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

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      console.log('Showing error toast:', error)
      toast.error(error)
    }
  }, [error, toast])

  // Show success toast when successMessage changes
  useEffect(() => {
    if (successMessage && user) {
      // Only redirect on successful login/signup (when user is authenticated)
      toast.success(successMessage)
      setTimeout(() => navigate('/'), 2000)
    }
  }, [successMessage, user, navigate]) // Added user to dependencies

  const handleSignUp = async (email: string, password: string, firstName: string = '', lastName: string = ''): Promise<boolean> => {
    const success = await signUp(email, password, firstName, lastName)
    return success
  }

  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    const success = await signIn(email, password)
    return success
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

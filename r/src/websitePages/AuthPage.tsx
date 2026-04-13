import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/forms/AuthForm'
import { useAuth } from '../customHooks/useAuth'
import '../styles/pages/AuthPage.css'

export default function AuthPage() {
  const navigate = useNavigate()
  const { user, loading, error, successMessage, signUp, signIn } = useAuth()

  const handleSignUp = async (email: string, password: string, firstName: string = '', lastName: string = ''): Promise<boolean> => {
    const success = await signUp(email, password, firstName, lastName)
    if (success) {
      setTimeout(() => navigate('/'), 2000)
    }
    return success
  }

  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    const success = await signIn(email, password)
    if (success) {
      setTimeout(() => navigate('/'), 2000)
    }
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
            error={error}
            successMessage={successMessage}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

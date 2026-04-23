import { useState } from 'react'
import { Mail, Lock } from 'lucide-react'
import { useToast } from '../../customHooks/useToast'
import '../../styles/components/AuthForm.css'

type AuthMode = 'login' | 'signup'

type AuthFormProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>
  onSignIn: (email: string, password: string) => Promise<boolean>
  loading: boolean
}

export default function AuthForm({
  onSignUp,
  onSignIn,
  loading,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const toast = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'login') {
      if (!formData.email.trim()) {
        toast.warning('Please enter your email')
        return
      }
      if (!formData.password.trim()) {
        toast.warning('Please enter your password')
        return
      }
      await onSignIn(formData.email, formData.password)
    } else {
      if (!formData.email.trim()) {
        toast.warning('Please enter your email')
        return
      }
      if (!formData.firstName.trim()) {
        toast.warning('Please enter your first name')
        return
      }
      if (!formData.lastName.trim()) {
        toast.warning('Please enter your last name')
        return
      }
      if (!formData.password.trim()) {
        toast.warning('Please enter a password')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.warning('Passwords do not match')
        return
      }
      await onSignUp(formData.email, formData.password, formData.firstName, formData.lastName)
    }
    
    // Clear form after successful submission (auth hook will handle the redirect)
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form-container">

      <div className="auth-form-group">
        <label className="auth-form-label">
          Email
        </label>
        <div className="auth-form-input-wrapper">
          <Mail className="auth-form-input-icon" size={20} />
          <input
            type="email"
            name="email"
            className="auth-form-input"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {mode === 'signup' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="auth-form-group">
              <label className="auth-form-label">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                className="auth-form-input"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-form-group">
              <label className="auth-form-label">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                className="auth-form-input"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </>
      )}

      <div className="auth-form-group">
        <label className="auth-form-label">
          Password
        </label>
        <div className="auth-form-input-wrapper">
          <Lock className="auth-form-input-icon" size={20} />
          <input
            type="password"
            name="password"
            className="auth-form-input"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {mode === 'signup' && (
        <div className="auth-form-group">
          <label className="auth-form-label">
            Confirm Password
          </label>
          <div className="auth-form-input-wrapper">
            <Lock className="auth-form-input-icon" size={20} />
            <input
              type="password"
              name="confirmPassword"
              className="auth-form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="auth-form-submit"
      >
        {loading
          ? 'Processing...'
          : mode === 'login'
            ? 'Sign In'
            : 'Create Account'}
      </button>

      <p className="auth-form-toggle">
        {mode === 'login'
          ? "Don't have an account? "
          : 'Already have an account? '}
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="auth-form-toggle-button"
        >
          {mode === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </form>
  )
}

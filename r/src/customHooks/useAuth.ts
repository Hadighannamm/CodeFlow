import { useState, useEffect, useContext, createContext, createElement } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types/UserProfile'
import { authService } from '../services/authService'

type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    checkAuth()

    // Subscribe to auth changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true)
    try {
      const newUser = await authService.signUp(email, password, username)
      setUser(newUser)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const authUser = await authService.signIn(email, password)
      setUser(authUser)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signUp,
    signIn,
    signOut,
  }

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
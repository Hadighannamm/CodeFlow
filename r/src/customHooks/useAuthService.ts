import { useToast } from './useToast'
import * as authService from '../services/authService'

export function useAuthService() {
  const toast = useToast()

  return {
    async signUpWithEmail(
      email: string,
      password: string,
      firstName?: string,
      lastName?: string
    ): Promise<any> {
      try {
        const result = await authService.signUpWithEmail(email, password, firstName, lastName)
        
        if (result.error) {
          toast.error(result.error.message || 'Failed to create account')
          return null
        }

        toast.success('Account created! Please check your email to confirm.')
        return result.data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create account'
        toast.error(message)
        return null
      }
    },

    async signInWithEmail(email: string, password: string): Promise<any> {
      try {
        const result = await authService.signInWithEmail(email, password)
        
        if (result.error) {
          toast.error(result.error.message || 'Failed to sign in')
          return null
        }

        toast.success('Signed in successfully!')
        return result.data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sign in'
        toast.error(message)
        return null
      }
    },

    async signOutUser(): Promise<boolean> {
      try {
        await authService.signOutUser()
        toast.success('Signed out successfully!')
        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sign out'
        toast.error(message)
        return false
      }
    },

    async getCurrentUser(): Promise<any> {
      try {
        return await authService.getCurrentUser()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch user'
        toast.error(message)
        return null
      }
    },

    async resendConfirmationEmail(email: string): Promise<boolean> {
      try {
        const result = await authService.resendConfirmationEmail(email)
        
        if (result.error) {
          toast.error(result.error.message || 'Failed to resend confirmation email')
          return false
        }

        toast.success('Confirmation email sent! Check your inbox.')
        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to resend confirmation email'
        toast.error(message)
        return false
      }
    },
  }
}

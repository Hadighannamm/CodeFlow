import type { AuthUser } from '../types/UserProfile'

export const authService = {
  async signUp(email: string, _password: string, username: string): Promise<AuthUser> {
    // TODO: Implement with Supabase auth
    console.log('Signing up', { email, username })
    throw new Error('Not implemented yet')
  },

  async signIn(email: string, _password: string): Promise<AuthUser> {
    // TODO: Implement with Supabase auth
    console.log('Signing in', { email })
    throw new Error('Not implemented yet')
  },

  async signOut(): Promise<void> {
    // TODO: Implement with Supabase auth
    console.log('Signing out')
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // TODO: Implement with Supabase auth session
    console.log('Getting current user')
    return null
  },

  async resetPassword(email: string): Promise<void> {
    // TODO: Implement with Supabase auth
    console.log('Resetting password for', email)
  },

  onAuthStateChange(_callback: (user: AuthUser | null) => void) {
    // TODO: Subscribe to Supabase auth changes
    return () => {}
  },
}

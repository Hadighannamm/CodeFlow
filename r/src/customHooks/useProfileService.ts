import { useToast } from './useToast'
import { profileService } from '../services/profileService'
import type { UserProfile } from '../types/UserProfile'

export function useProfileService() {
  const toast = useToast()

  return {
    async getUserProfile(id: string): Promise<UserProfile | null> {
      try {
        const result = await profileService.getUserProfile(id)
        return result.data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load profile'
        toast.error(message)
        return null
      }
    },

    async updateUserProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
      try {
        const result = await profileService.updateUserProfile(id, data)
        toast.success('Profile updated successfully!')
        return result.data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update profile'
        toast.error(message)
        return null
      }
    },


  }
}

import { useToast } from './useToast'
import { profileService } from '../services/profileService'
import type { UserProfile } from '../types/UserProfile'

export function useProfileService() {
  const toast = useToast()

  return {
    async getUserProfile(id: string): Promise<UserProfile | null> {
      try {
        return await profileService.getUserProfile(id)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load profile'
        toast.error(message)
        return null
      }
    },

    async updateUserProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
      try {
        const profile = await profileService.updateUserProfile(id, data)
        toast.success('Profile updated successfully!')
        return profile
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update profile'
        toast.error(message)
        return null
      }
    },

    async getUserStats(userId: string): Promise<any> {
      try {
        return await profileService.getUserStats(userId)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load user stats'
        toast.error(message)
        return null
      }
    },

    async searchUsers(query: string): Promise<UserProfile[]> {
      try {
        return await profileService.searchUsers(query)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to search users'
        toast.error(message)
        return []
      }
    },

    async incrementReputation(userId: string, amount: number): Promise<boolean> {
      try {
        await profileService.incrementReputation(userId, amount)
        return true
      } catch (error) {
        console.error('Failed to update reputation')
        return false
      }
    },
  }
}

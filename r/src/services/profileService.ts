import { supabase } from '../lib/supabaseClient'
import type { UserProfile } from '../types/UserProfile'

export const profileService = {
  // Fetch user profile by ID
  async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      // If user profile doesn't exist, return a default profile
      if (error && error.code === 'PGRST116') {
        console.log('User profile not found, returning default profile')
        
        // Get the current authenticated user's email
        const { data: authData } = await supabase.auth.getUser()
        const email = authData?.user?.email ?? ''
        
        // Return a default profile that the user can edit and save
        const defaultProfile: UserProfile = {
          id: userId,
          username: email.split('@')[0] || 'user',
          email: email,
          firstName: '',
          lastName: '',
          reputation: 0,
          bio: '',
          avatarUrl: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return { data: defaultProfile, error: null }
      }

      if (error) {
        console.error('Error fetching user profile:', error)
        return { data: null, error }
      }

      // Map database fields to UserProfile type
      const profile: UserProfile = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        reputation: data.reputation || 0,
        bio: data.bio || '',
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      return { data: profile, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const updateData: any = {}

      // Only update fields that have values
      if (updates.firstName !== undefined && updates.firstName !== '') updateData.first_name = updates.firstName
      if (updates.lastName !== undefined && updates.lastName !== '') updateData.last_name = updates.lastName
      if (updates.username !== undefined && updates.username !== '') updateData.username = updates.username
      if (updates.bio !== undefined) updateData.bio = updates.bio || ''
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl

      // If no fields to update, return current user
      if (Object.keys(updateData).length === 0) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (!data) return { data: null, error: 'User not found' }

        return { 
          data: {
            id: data.id,
            username: data.username,
            email: data.email,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            reputation: data.reputation || 0,
            bio: data.bio || '',
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
          error: null 
        }
      }

      // Get user email from auth
      const { data: authData } = await supabase.auth.getUser()
      const email = authData?.user?.email || updates.email || ''

      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: email,
          username: updateData.username || updates.username || email.split('@')[0],
          first_name: updateData.first_name || updates.firstName || '',
          last_name: updateData.last_name || updates.lastName || '',
          bio: updateData.bio !== undefined ? updateData.bio : (updates.bio || ''),
          avatar_url: updateData.avatar_url || updates.avatarUrl,
          reputation: updates.reputation || 0,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return { data: null, error }
      }

      // Map database fields to UserProfile type
      const profile: UserProfile = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        reputation: data.reputation || 0,
        bio: data.bio || '',
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      return { data: profile, error: null }
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return { data: null, error }
    }
  },

  // Upload avatar image
  async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: any }> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { url: null, error: 'File must be an image' }
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { url: null, error: 'File size must be less than 5MB' }
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = fileName

      console.log('Uploading avatar:', { userId, fileName, filePath, fileType: file.type })

      // Upload file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('ProfilePhoto')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        
        // Check if it's a bucket not found error
        if (uploadError.message?.includes('Bucket not found')) {
          return { 
            url: null, 
            error: 'Storage bucket not configured. Please create a "ProfilePhoto" bucket in Supabase and set it to public.' 
          }
        }
        
        return { url: null, error: uploadError.message || 'Failed to upload avatar' }
      }

      console.log('File uploaded successfully:', data)

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('ProfilePhoto')
        .getPublicUrl(filePath)

      console.log('Public URL data:', publicUrlData)

      if (!publicUrlData?.publicUrl) {
        return { url: null, error: 'Failed to get public URL' }
      }

      console.log('Generated public URL:', publicUrlData.publicUrl)

      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update avatar URL in database:', updateError)
        return { url: null, error: 'Failed to save avatar URL' }
      }

      console.log('Avatar URL saved to database successfully')
      return { url: publicUrlData.publicUrl, error: null }
    } catch (error) {
      console.error('Avatar upload error:', error)
      return { url: null, error: 'Failed to upload avatar. Please check your connection.' }
    }
  },

  // Get user's questions count
  async getUserQuestionsCount(userId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      return count || 0
    } catch (error) {
      console.error('Error fetching questions count:', error)
      return 0
    }
  },

  // Get user's answers count
  async getUserAnswersCount(userId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      return count || 0
    } catch (error) {
      console.error('Error fetching answers count:', error)
      return 0
    }
  },

  // Get user's recent questions
  async getUserQuestions(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, title, body, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching user questions:', error?.message || JSON.stringify(error))
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserQuestions:', error instanceof Error ? error.message : String(error))
      return []
    }
  },
}

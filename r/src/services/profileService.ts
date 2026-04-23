import { supabase } from '../lib/supabaseClient'
import type { UserProfile } from '../types/UserProfile'
import type { Question } from '../types/Question'

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

  async getUserRecentQuestions(userId: string, limit: number = 5): Promise<Question[]> {
    try {
      const [{ data: ownQuestions }, { data: repostRows }] = await Promise.all([
        supabase
          .from('questions')
          .select('id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('question_reposts')
          .select('question_id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      const activity = [
        ...(ownQuestions || []).map((question: any) => ({
          questionId: question.id,
          activityAt: question.created_at,
        })),
        ...(repostRows || []).map((row: any) => ({
          questionId: row.question_id,
          activityAt: row.created_at,
        })),
      ]

      if (activity.length === 0) {
        return []
      }

      const latestByQuestionId = new Map<string, string>()
      for (const item of activity) {
        const existing = latestByQuestionId.get(item.questionId)
        if (!existing || new Date(item.activityAt).getTime() > new Date(existing).getTime()) {
          latestByQuestionId.set(item.questionId, item.activityAt)
        }
      }

      const orderedQuestionIds = Array.from(latestByQuestionId.entries())
        .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
        .slice(0, limit)
        .map(([questionId]) => questionId)

      if (orderedQuestionIds.length === 0) {
        return []
      }

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, title, body, user_id, view_count, repost_count, created_at, updated_at')
        .in('id', orderedQuestionIds)

      if (questionsError || !questions) {
        console.error('Error fetching recent question rows:', questionsError)
        return []
      }

      const authorIds = Array.from(new Set(questions.map((question: any) => question.user_id)))

      const [usersResult, tagsResult, votesResult, answersResult] = await Promise.all([
        supabase
          .from('users')
          .select('id, username, email, first_name, last_name, reputation, bio, avatar_url, created_at, updated_at')
          .in('id', authorIds),
        supabase
          .from('question_tags')
          .select('question_id, tags(id, name)')
          .in('question_id', orderedQuestionIds),
        supabase
          .from('votes')
          .select('target_id, vote_type')
          .eq('target_type', 'question')
          .in('target_id', orderedQuestionIds),
        supabase
          .from('answers')
          .select('question_id')
          .in('question_id', orderedQuestionIds),
      ])

      if (usersResult.error || tagsResult.error || votesResult.error || answersResult.error) {
        console.error('Error hydrating recent questions:', {
          usersError: usersResult.error,
          tagsError: tagsResult.error,
          votesError: votesResult.error,
          answersError: answersResult.error,
        })
        return []
      }

      const authorMap = new Map(
        (usersResult.data || []).map((u: any) => [
          u.id,
          {
            id: u.id,
            username: u.username || 'Unknown',
            email: u.email || '',
            firstName: u.first_name || '',
            lastName: u.last_name || '',
            reputation: u.reputation || 0,
            bio: u.bio || '',
            avatarUrl: u.avatar_url,
            createdAt: u.created_at,
            updatedAt: u.updated_at,
          },
        ])
      )

      const tagsByQuestionId = new Map<string, Array<{ id: string; name: string; count: number }>>()
      for (const row of tagsResult.data || []) {
        const list = tagsByQuestionId.get((row as any).question_id) || []
        const tag = (row as any).tags
        if (tag?.id && tag?.name) {
          list.push({ id: tag.id, name: tag.name, count: 0 })
        }
        tagsByQuestionId.set((row as any).question_id, list)
      }

      const voteCountByQuestionId = new Map<string, number>()
      for (const vote of votesResult.data || []) {
        const key = (vote as any).target_id
        const value = Number((vote as any).vote_type) || 0
        voteCountByQuestionId.set(key, (voteCountByQuestionId.get(key) || 0) + value)
      }

      const answerCountByQuestionId = new Map<string, number>()
      for (const answer of answersResult.data || []) {
        const key = (answer as any).question_id
        answerCountByQuestionId.set(key, (answerCountByQuestionId.get(key) || 0) + 1)
      }

      const questionMap = new Map(
        questions.map((question: any) => [
          question.id,
          {
            id: question.id,
            title: question.title,
            body: question.body,
            tags: tagsByQuestionId.get(question.id) || [],
            author:
              authorMap.get(question.user_id) || {
                id: question.user_id,
                username: 'Unknown',
                email: '',
                firstName: '',
                lastName: '',
                reputation: 0,
                bio: '',
                avatarUrl: undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            authorId: question.user_id,
            votes: voteCountByQuestionId.get(question.id) || 0,
            repostCount: question.repost_count || 0,
            answerCount: answerCountByQuestionId.get(question.id) || 0,
            viewCount: question.view_count || 0,
            createdAt: question.created_at,
            updatedAt: question.updated_at,
          } as Question,
        ])
      )

      const orderedQuestions = orderedQuestionIds
        .map((questionId) => questionMap.get(questionId))
        .filter(Boolean) as Question[]

      return orderedQuestions
    } catch (error) {
      console.error('Error in getUserRecentQuestions:', error)
      return []
    }
  },
}

import { supabase } from '../lib/supabaseClient'
import { reputationService } from './reputationService'

export const repostService = {
  async hasUserReposted(userId: string, questionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('question_reposts')
        .select('id')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .maybeSingle()

      if (error) {
        console.error('Error checking repost state:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error in hasUserReposted:', error)
      return false
    }
  },

  async toggleRepost(
    userId: string,
    questionId: string
  ): Promise<{ success: boolean; isReposted: boolean }> {
    try {
      const { data: existingRepost, error: existingError } = await supabase
        .from('question_reposts')
        .select('id')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .maybeSingle()

      if (existingError) {
        console.error('Error checking existing repost:', existingError)
        return { success: false, isReposted: false }
      }

      const { data: questionRow, error: selectError } = await supabase
        .from('questions')
        .select('repost_count')
        .eq('id', questionId)
        .single()

      if (selectError) {
        console.error('Error reading repost_count:', selectError)
        return { success: false, isReposted: !!existingRepost }
      }

      const currentCount = Math.max(questionRow?.repost_count || 0, 0)

      if (existingRepost) {
        const { error: deleteError } = await supabase
          .from('question_reposts')
          .delete()
          .eq('id', existingRepost.id)

        if (deleteError) {
          console.error('Error removing repost:', deleteError)
          return { success: false, isReposted: true }
        }

        const { error: updateError } = await supabase
          .from('questions')
          .update({ repost_count: Math.max(currentCount - 1, 0) })
          .eq('id', questionId)

        if (updateError) {
          console.error('Error decrementing repost_count:', updateError)
        }

        await reputationService.incrementUserReputation(userId, -1)

        return { success: true, isReposted: false }
      }

      const { error: insertError } = await supabase
        .from('question_reposts')
        .insert({
          user_id: userId,
          question_id: questionId,
        })

      if (insertError) {
        console.error('Error creating repost:', insertError)
        return { success: false, isReposted: false }
      }

      const nextCount = currentCount + 1
      const { error: updateError } = await supabase
        .from('questions')
        .update({ repost_count: nextCount })
        .eq('id', questionId)

      if (updateError) {
        console.error('Error updating repost_count:', updateError)
      }

      await reputationService.incrementUserReputation(userId, 1)

      return { success: true, isReposted: true }
    } catch (error) {
      console.error('Error in toggleRepost:', error)
      return { success: false, isReposted: false }
    }
  },
}

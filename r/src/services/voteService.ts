import type { Vote, VoteInput } from '../types/Vote'
import { supabase } from '../lib/supabaseClient'
import { reputationService } from './reputationService'

export const voteService = {
  async getUserVote(userId: string, targetId: string): Promise<Vote | null> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', userId)
        .eq('target_id', targetId)

      if (error) {
        console.error('Error fetching user vote:', error)
        return null
      }
      
      if (!data || data.length === 0) return null
      
      const voteData = data[0]
      return {
        id: voteData.id,
        userId: voteData.user_id,
        targetId: voteData.target_id,
        targetType: voteData.target_type,
        voteType: parseInt(voteData.vote_type) as 1 | -1,
        createdAt: voteData.created_at,
      }
    } catch (err) {
      console.error('Error fetching user vote:', err)
      return null
    }
  },

  async createVote(data: VoteInput & { userId: string }): Promise<Vote> {
    try {
      const { data: newVote, error } = await supabase
        .from('votes')
        .insert([{
          user_id: data.userId,
          target_id: data.targetId,
          target_type: data.targetType,
          vote_type: data.voteType,
        }])
        .select()
        .single()

      if (error) throw error

      await reputationService.incrementUserReputation(data.userId, 1)

      return {
        id: newVote.id,
        userId: newVote.user_id,
        targetId: newVote.target_id,
        targetType: newVote.target_type,
        voteType: parseInt(newVote.vote_type) as 1 | -1,
        createdAt: newVote.created_at,
      }
    } catch (err) {
      console.error('Error creating vote:', err)
      throw new Error('Failed to create vote')
    }
  },

  async updateVote(id: string, voteType: 1 | -1): Promise<Vote> {
    try {
      const { data: updatedVote, error } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await reputationService.incrementUserReputation(updatedVote.user_id, 1)

      return {
        id: updatedVote.id,
        userId: updatedVote.user_id,
        targetId: updatedVote.target_id,
        targetType: updatedVote.target_type,
        voteType: parseInt(updatedVote.vote_type) as 1 | -1,
        createdAt: updatedVote.created_at,
      }
    } catch (err) {
      console.error('Error updating vote:', err)
      throw new Error('Failed to update vote')
    }
  },

  async deleteVote(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', id)

      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        await reputationService.incrementUserReputation(user.id, -1)
      }
    } catch (err) {
      console.error('Error deleting vote:', err)
      throw new Error('Failed to delete vote')
    }
  },

  async getVoteCount(targetId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('target_id', targetId)

      if (error) throw error
      
      const count = data.reduce((sum, vote) => sum + parseInt(vote.vote_type), 0)
      return count
    } catch (err) {
      console.error('Error getting vote count:', err)
      return 0
    }
  },
}

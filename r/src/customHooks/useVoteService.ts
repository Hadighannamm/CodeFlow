import { useToast } from './useToast'
import { voteService } from '../services/voteService'
import type { Vote, VoteInput } from '../types/Vote'

export function useVoteService() {
  const toast = useToast()

  return {
    async getUserVote(userId: string, targetId: string): Promise<Vote | null> {
      try {
        return await voteService.getUserVote(userId, targetId)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch vote'
        toast.error(message)
        return null
      }
    },

    async createVote(data: VoteInput & { userId: string }): Promise<Vote | null> {
      try {
        const vote = await voteService.createVote(data)
        toast.success('Vote recorded!')
        return vote
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to record vote'
        toast.error(message)
        return null
      }
    },

    async updateVote(id: string, voteType: 1 | -1): Promise<Vote | null> {
      try {
        const vote = await voteService.updateVote(id, voteType)
        toast.success('Vote updated!')
        return vote
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update vote'
        toast.error(message)
        return null
      }
    },

    async deleteVote(id: string): Promise<boolean> {
      try {
        await voteService.deleteVote(id)
        toast.success('Vote removed!')
        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove vote'
        toast.error(message)
        return false
      }
    },
  }
}

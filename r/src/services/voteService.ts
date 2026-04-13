import type { Vote, VoteInput } from '../types/Vote'

export const voteService = {
  async getUserVote(userId: string, targetId: string): Promise<Vote | null> {
    // TODO: Implement with Supabase query
    console.log('Fetching user vote', userId, targetId)
    return null
  },

  async createVote(data: VoteInput & { userId: string }): Promise<Vote> {
    // TODO: Implement with Supabase insert/update
    console.log('Creating vote', data)
    throw new Error('Not implemented yet')
  },

  async updateVote(id: string, voteType: 1 | -1): Promise<Vote> {
    // TODO: Implement with Supabase update
    console.log('Updating vote', id, voteType)
    throw new Error('Not implemented yet')
  },

  async deleteVote(id: string): Promise<void> {
    // TODO: Implement with Supabase delete
    console.log('Deleting vote', id)
  },

  async getVoteCount(targetId: string): Promise<number> {
    // TODO: Implement with Supabase query
    console.log('Getting vote count for', targetId)
    return 0
  },
}

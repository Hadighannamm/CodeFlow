import { supabase } from '../lib/supabaseClient'

export const reputationService = {
  async incrementUserReputation(userId: string, amount: number = 1): Promise<void> {
    try {
      const { data: userRow, error: readError } = await supabase
        .from('users')
        .select('reputation')
        .eq('id', userId)
        .single()

      if (readError) {
        console.error('Failed to read user reputation:', readError)
        return
      }

      const nextReputation = Math.max((userRow?.reputation || 0) + amount, 0)

      const { error: updateError } = await supabase
        .from('users')
        .update({ reputation: nextReputation })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to update user reputation:', updateError)
      }
    } catch (error) {
      console.error('Unexpected reputation update error:', error)
    }
  },
}

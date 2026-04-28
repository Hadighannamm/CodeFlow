import { supabase } from '../lib/supabaseClient'
import type { Poll, PollOption, PollVote } from '../types/Poll'

export const pollService = {
  // Create a poll with options
  async createPoll(questionId: string, options: string[]): Promise<{ data: Poll | null; error: any }> {
    try {
      if (!options || options.length < 2) {
        return { data: null, error: 'Poll must have at least 2 options' }
      }

      // Create poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          question_id: questionId,
        })
        .select()
        .single()

      if (pollError) {
        console.error('Error creating poll:', pollError)
        return { data: null, error: pollError }
      }

      // Create poll options
      const optionsToInsert = options.map((text) => ({
        poll_id: pollData.id,
        text: text,
        votes: 0,
      }))

      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert)
        .select()

      if (optionsError) {
        console.error('Error creating poll options:', optionsError)
        return { data: null, error: optionsError }
      }

      const poll: Poll = {
        id: pollData.id,
        questionId: pollData.question_id,
        options: optionsData.map((opt: any) => ({
          id: opt.id,
          pollId: opt.poll_id,
          text: opt.text,
          votes: opt.votes,
        })),
        createdAt: pollData.created_at,
        updatedAt: pollData.updated_at,
      }

      return { data: poll, error: null }
    } catch (error) {
      console.error('Error in createPoll:', error)
      return { data: null, error }
    }
  },

  // Get poll by question ID
  async getPollByQuestionId(questionId: string): Promise<{ data: Poll | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('question_id', questionId)
        .single()

      if (error && error.code === 'PGRST116') {
        // No poll found
        return { data: null, error: null }
      }

      if (error) {
        console.error('Error fetching poll:', error)
        return { data: null, error }
      }

      // Fetch poll options
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', data.id)

      if (optionsError) {
        console.error('Error fetching poll options:', optionsError)
        return { data: null, error: optionsError }
      }

      const poll: Poll = {
        id: data.id,
        questionId: data.question_id,
        options: optionsData.map((opt: any) => ({
          id: opt.id,
          pollId: opt.poll_id,
          text: opt.text,
          votes: opt.votes,
        })),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      return { data: poll, error: null }
    } catch (error) {
      console.error('Error in getPollByQuestionId:', error)
      return { data: null, error }
    }
  },

  // Vote on a poll option
  async votePoll(pollId: string, optionId: string, userId: string): Promise<{ data: PollVote | null; error: any }> {
    try {
      // Check if user already voted for this poll
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single()

      if (existingVote) {
        return { data: null, error: 'You have already voted on this poll' }
      }

      // Insert vote
      const { data, error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: userId,
        })
        .select()
        .single()

      if (error) {
        console.error('Error voting on poll:', error)
        return { data: null, error }
      }

      // Directly increment votes as backup (in case trigger doesn't work)
      const { data: optionData } = await supabase
        .from('poll_options')
        .select('votes')
        .eq('id', optionId)
        .single()

      const currentVotes = optionData?.votes || 0
      const { error: updateError } = await supabase
        .from('poll_options')
        .update({ votes: currentVotes + 1 })
        .eq('id', optionId)

      if (updateError) {
        console.warn('Warning: Could not update vote count:', updateError)
      }

      const vote: PollVote = {
        id: data.id,
        pollId: data.poll_id,
        optionId: data.option_id,
        userId: data.user_id,
        createdAt: data.created_at,
      }

      return { data: vote, error: null }
    } catch (error) {
      console.error('Error in votePoll:', error)
      return { data: null, error }
    }
  },

  // Check if user has voted on a poll
  async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single()

      return !!data
    } catch (error) {
      console.error('Error checking user vote:', error)
      return false
    }
  },
}

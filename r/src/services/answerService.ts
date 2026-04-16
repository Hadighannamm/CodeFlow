import type { Answer, CreateAnswerInput, UpdateAnswerInput } from '../types/Answer'
import { supabase } from '../lib/supabaseClient'

export const answerService = {
  async getAnswersByQuestion(questionId: string): Promise<Answer[]> {
    try {
      const { data: answers, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching answers:', error)
        return []
      }

      if (!answers || answers.length === 0) {
        return []
      }

      // Fetch full data for each answer
      const answersWithData = await Promise.all(
        answers.map(async (answer) => {
          try {
            // Fetch user
            const { data: user } = await supabase
              .from('users')
              .select('*')
              .eq('id', answer.user_id)
              .single()

            return {
              id: answer.id,
              body: answer.body,
              questionId: answer.question_id,
              userId: answer.user_id,
              author: user ? {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                reputation: user.reputation || 0,
                bio: user.bio || '',
                avatarUrl: user.avatar_url,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
              } : {
                id: answer.user_id,
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
              votes: answer.votes || 0,
              isAccepted: answer.is_accepted || false,
              createdAt: answer.created_at,
              updatedAt: answer.updated_at,
            }
          } catch (err) {
            console.error(`Error processing answer ${answer.id}:`, err)
            return null
          }
        })
      )

      return answersWithData.filter((a) => a !== null)
    } catch (err) {
      console.error('Error fetching answers:', err)
      return []
    }
  },

  async getAnswerById(id: string): Promise<Answer | null> {
    try {
      const { data: answer, error } = await supabase
        .from('answers')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !answer) {
        console.error('Error fetching answer:', error)
        return null
      }

      // Fetch user
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', answer.user_id)
        .single()

      return {
        id: answer.id,
        body: answer.body,
        questionId: answer.question_id,
        userId: answer.user_id,
        author: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          reputation: user.reputation || 0,
          bio: user.bio || '',
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        } : {
          id: answer.user_id,
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
        votes: answer.votes || 0,
        isAccepted: answer.is_accepted || false,
        createdAt: answer.created_at,
        updatedAt: answer.updated_at,
      }
    } catch (err) {
      console.error('Error fetching answer:', err)
      return null
    }
  },

  async createAnswer(data: CreateAnswerInput): Promise<Answer> {
    try {
      const { data: answer, error } = await supabase
        .from('answers')
        .insert({
          body: data.body,
          question_id: data.questionId,
          user_id: data.userId,
        })
        .select()
        .single()

      if (error || !answer) {
        throw error || new Error('Failed to create answer')
      }

      // Fetch full answer with user data
      const fullAnswer = await this.getAnswerById(answer.id)
      if (!fullAnswer) {
        throw new Error('Failed to fetch created answer')
      }

      return fullAnswer
    } catch (err) {
      console.error('Error creating answer:', err)
      throw err
    }
  },

  async updateAnswer(id: string, data: UpdateAnswerInput): Promise<Answer> {
    // TODO: Implement with Supabase update
    console.log('Updating answer', id, data)
    throw new Error('Not implemented yet')
  },

  async deleteAnswer(id: string): Promise<void> {
    // TODO: Implement with Supabase delete
    console.log('Deleting answer', id)
  },

  async markAnswerAsAccepted(id: string): Promise<Answer> {
    // TODO: Implement with Supabase update
    console.log('Marking answer as accepted', id)
    throw new Error('Not implemented yet')
  },
}

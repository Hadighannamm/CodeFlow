import { supabase } from '../lib/supabaseClient'
import type { Question } from '../types/Question'
import { reputationService } from './reputationService'

export const savedQuestionService = {
  async saveQuestion(userId: string, questionId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_questions')
      .insert([
        {
          user_id: userId,
          question_id: questionId,
        },
      ])

    if (error) {
      console.error('Error saving question:', error)
      throw error
    }

    await reputationService.incrementUserReputation(userId, -1)
  },

  async removeSavedQuestion(userId: string, questionId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_questions')
      .delete()
      .eq('user_id', userId)
      .eq('question_id', questionId)

    if (error) {
      console.error('Error removing saved question:', error)
      throw error
    }

    await reputationService.incrementUserReputation(userId, 1)
  },

  async isSavedQuestion(userId: string, questionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_questions')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if question is saved:', error)
      return false
    }

    return !!data
  },

  async getSavedQuestions(userId: string): Promise<Question[]> {
    try {
      // Get saved question IDs
      const { data: savedQuestionsData, error: savedError } = await supabase
        .from('saved_questions')
        .select('question_id')
        .eq('user_id', userId)

      if (savedError) {
        console.error('Error fetching saved questions:', savedError)
        return []
      }

      if (!savedQuestionsData || savedQuestionsData.length === 0) {
        return []
      }

      const questionIds = savedQuestionsData.map((sq) => sq.question_id)

      // Fetch question details
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds)

      if (questionsError) {
        console.error('Error fetching question details:', questionsError)
        return []
      }

      if (!questions || questions.length === 0) {
        return []
      }

      // Fetch full data for each question
      const questionsWithData = await Promise.all(
        questions.map(async (question) => {
          try {
            // Fetch user
            const { data: user } = await supabase
              .from('users')
              .select('*')
              .eq('id', question.user_id)
              .single()

            // Fetch tags
            const { data: tagData } = await supabase
              .from('question_tags')
              .select('tags (*)')
              .eq('question_id', question.id)

            // Fetch vote count for this question
            const { data: votes } = await supabase
              .from('votes')
              .select('vote_type')
              .eq('target_id', question.id)
              .eq('target_type', 'question')

            const voteCount = votes ? votes.reduce((sum, vote) => sum + parseInt(vote.vote_type), 0) : 0

            const author = user
              ? {
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
                }
              : {
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
                }

            const tags = (tagData || []).map((item: any) => ({
              id: item.tags.id,
              name: item.tags.name,
              count: 0,
            }))

            return {
              id: question.id,
              title: question.title,
              body: question.body,
              tags,
              author,
              authorId: question.user_id,
              votes: voteCount,
              repostCount: question.repost_count || 0,
              answerCount: 0,
              viewCount: question.view_count || 0,
              createdAt: question.created_at,
              updatedAt: question.updated_at,
            }
          } catch (err) {
            console.error(`Error processing question ${question.id}:`, err)
            return null
          }
        })
      )

      return questionsWithData.filter((q) => q !== null) as Question[]
    } catch (err) {
      console.error('Error in getSavedQuestions:', err)
      return []
    }
  },
}

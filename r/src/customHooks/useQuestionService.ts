import { useToast } from './useToast'
import { questionService } from '../services/questionService'
import type { Question, CreateQuestionInput, UpdateQuestionInput } from '../types/Question'

export function useQuestionService() {
  const toast = useToast()

  return {
    async getAllQuestions(sortBy: 'newest' | 'most-viewed' | 'most-liked' = 'newest'): Promise<Question[]> {
      try {
        return await questionService.getAllQuestions(sortBy)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load questions'
        toast.error(message)
        return []
      }
    },

    async getQuestionById(id: string): Promise<Question | null> {
      try {
        return await questionService.getQuestionById(id)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load question'
        toast.error(message)
        return null
      }
    },

    async createQuestion(data: CreateQuestionInput & { userId: string }): Promise<Question | null> {
      try {
        const question = await questionService.createQuestion(data)
        toast.success('Question posted successfully!')
        return question
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to post question'
        toast.error(message)
        return null
      }
    },

    async updateQuestion(id: string, data: UpdateQuestionInput): Promise<Question | null> {
      try {
        const question = await questionService.updateQuestion(id, data)
        toast.success('Question updated successfully!')
        return question
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update question'
        toast.error(message)
        return null
      }
    },

    async deleteQuestion(id: string): Promise<boolean> {
      try {
        await questionService.deleteQuestion(id)
        toast.success('Question deleted successfully!')
        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete question'
        toast.error(message)
        return false
      }
    },

    async searchQuestions(query: string): Promise<Question[]> {
      try {
        return await questionService.searchQuestions(query)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to search questions'
        toast.error(message)
        return []
      }
    },


  }
}

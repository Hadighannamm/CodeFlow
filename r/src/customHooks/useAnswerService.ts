import { useToast } from './useToast'
import { answerService } from '../services/answerService'
import type { Answer, CreateAnswerInput, UpdateAnswerInput } from '../types/Answer'

export function useAnswerService() {
  const toast = useToast()

  return {
    async getAnswersByQuestion(questionId: string): Promise<Answer[]> {
      try {
        return await answerService.getAnswersByQuestion(questionId)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load answers'
        toast.error(message)
        return []
      }
    },

    async getAnswerById(id: string): Promise<Answer | null> {
      try {
        return await answerService.getAnswerById(id)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load answer'
        toast.error(message)
        return null
      }
    },

    async createAnswer(data: CreateAnswerInput & { userId: string }): Promise<Answer | null> {
      try {
        const answer = await answerService.createAnswer(data)
        toast.success('Answer posted successfully!')
        return answer
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to post answer'
        toast.error(message)
        return null
      }
    },

    async updateAnswer(id: string, data: UpdateAnswerInput): Promise<Answer | null> {
      try {
        const answer = await answerService.updateAnswer(id, data)
        toast.success('Answer updated successfully!')
        return answer
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update answer'
        toast.error(message)
        return null
      }
    },

    async deleteAnswer(id: string): Promise<boolean> {
      try {
        await answerService.deleteAnswer(id)
        toast.success('Answer deleted successfully!')
        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete answer'
        toast.error(message)
        return false
      }
    },


  }
}

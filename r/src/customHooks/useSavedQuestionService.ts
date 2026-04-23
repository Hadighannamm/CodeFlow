import { useToast } from './useToast'
import { savedQuestionService } from '../services/savedQuestionService'

export function useSavedQuestionService() {
  const toast = useToast()

  return {
    async getSavedQuestions(userId: string): Promise<any[]> {
      try {
        return await savedQuestionService.getSavedQuestions(userId)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load saved questions'
        toast.error(message)
        return []
      }
    },

    async saveQuestion(userId: string, questionId: string): Promise<boolean> {
      try {
        await savedQuestionService.saveQuestion(userId, questionId)
        toast.success('Question saved!')
        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save question'
        toast.error(message)
        return false
      }
    },

    async unsaveQuestion(userId: string, questionId: string): Promise<boolean> {
      try {
        await savedQuestionService.removeSavedQuestion(userId, questionId)
        toast.success('Question removed from saved!')
        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to unsave question'
        toast.error(message)
        return false
      }
    },

    async isQuestionSaved(userId: string, questionId: string): Promise<boolean> {
      try {
        return await savedQuestionService.isSavedQuestion(userId, questionId)
      } catch (error) {
        console.error('Failed to check if question is saved')
        return false
      }
    },
  }
}

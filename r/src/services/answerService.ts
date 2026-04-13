import type { Answer, CreateAnswerInput, UpdateAnswerInput } from '../types/Answer'

export const answerService = {
  async getAnswersByQuestion(questionId: string): Promise<Answer[]> {
    // TODO: Implement with Supabase query
    console.log('Fetching answers for question', questionId)
    return []
  },

  async getAnswerById(id: string): Promise<Answer | null> {
    // TODO: Implement with Supabase query
    console.log('Fetching answer', id)
    return null
  },

  async createAnswer(data: CreateAnswerInput): Promise<Answer> {
    // TODO: Implement with Supabase insert
    console.log('Creating answer', data)
    throw new Error('Not implemented yet')
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

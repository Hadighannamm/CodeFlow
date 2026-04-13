import type { Question, CreateQuestionInput, UpdateQuestionInput } from '../types/Question'

export const questionService = {
  async getAllQuestions(sortBy: 'newest' | 'hot' | 'votes' = 'newest'): Promise<Question[]> {
    // TODO: Implement with Supabase query
    console.log('Fetching questions sorted by', sortBy)
    return []
  },

  async getQuestionById(id: string): Promise<Question | null> {
    // TODO: Implement with Supabase query
    console.log('Fetching question', id)
    return null
  },

  async createQuestion(data: CreateQuestionInput): Promise<Question> {
    // TODO: Implement with Supabase insert
    console.log('Creating question', data)
    throw new Error('Not implemented yet')
  },

  async updateQuestion(id: string, data: UpdateQuestionInput): Promise<Question> {
    // TODO: Implement with Supabase update
    console.log('Updating question', id, data)
    throw new Error('Not implemented yet')
  },

  async deleteQuestion(id: string): Promise<void> {
    // TODO: Implement with Supabase delete
    console.log('Deleting question', id)
  },

  async searchQuestions(query: string, tags?: string[]): Promise<Question[]> {
    // TODO: Implement search with Supabase
    console.log('Searching questions:', query, tags)
    return []
  },
}

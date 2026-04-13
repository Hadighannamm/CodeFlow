import type { Tag, CreateTagInput } from '../types/Tag'

export const tagService = {
  async getAllTags(): Promise<Tag[]> {
    // TODO: Implement with Supabase query
    console.log('Fetching all tags')
    return []
  },

  async getTagById(id: string): Promise<Tag | null> {
    // TODO: Implement with Supabase query
    console.log('Fetching tag', id)
    return null
  },

  async createTag(data: CreateTagInput): Promise<Tag> {
    // TODO: Implement with Supabase insert
    console.log('Creating tag', data)
    throw new Error('Not implemented yet')
  },

  async updateTag(id: string, data: Partial<CreateTagInput>): Promise<Tag> {
    // TODO: Implement with Supabase update
    console.log('Updating tag', id, data)
    throw new Error('Not implemented yet')
  },

  async deleteTag(id: string): Promise<void> {
    // TODO: Implement with Supabase delete
    console.log('Deleting tag', id)
  },

  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    // TODO: Implement with Supabase query
    console.log('Fetching popular tags, limit:', limit)
    return []
  },

  async searchTags(query: string): Promise<Tag[]> {
    // TODO: Implement with Supabase search
    console.log('Searching tags:', query)
    return []
  },
}

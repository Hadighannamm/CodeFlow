import { useToast } from './useToast'
import { tagService } from '../services/tagService'
import type { Tag } from '../types/Tag'

export function useTagService() {
  const toast = useToast()

  return {
    async getAllTags(sortBy: 'popular' | 'new' = 'popular'): Promise<Tag[]> {
      try {
        return await tagService.getAllTags(sortBy)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load tags'
        toast.error(message)
        return []
      }
    },

    async getQuestionsByTag(tagId: string): Promise<any[]> {
      try {
        return await tagService.getQuestionsByTag(tagId)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load questions for this tag'
        toast.error(message)
        return []
      }
    },

    async getTagById(id: string): Promise<Tag | null> {
      try {
        return await tagService.getTagById(id)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load tag'
        toast.error(message)
        return null
      }
    },

    async searchTags(query: string): Promise<Tag[]> {
      try {
        return await tagService.searchTags(query)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to search tags'
        toast.error(message)
        return []
      }
    },
  }
}

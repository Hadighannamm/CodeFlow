import type { Tag, CreateTagInput } from '../types/Tag'
import { supabase } from '../lib/supabaseClient'

export const tagService = {
  async getAllTags(sortBy: 'popular' | 'new' = 'popular'): Promise<Tag[]> {
    try {
      console.log('Fetching all tags')
      
      // Fetch all tags
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order(sortBy === 'popular' ? 'id' : 'id', { ascending: false })

      if (tagsError) {
        console.error('Error fetching tags:', tagsError)
        return []
      }

      if (!tags || tags.length === 0) {
        return []
      }

      // For each tag, count how many questions use it
      const tagsWithCounts = await Promise.all(
        tags.map(async (tag) => {
          const { count, error: countError } = await supabase
            .from('question_tags')
            .select('*', { count: 'exact', head: true })
            .eq('tag_id', tag.id)

          if (countError) {
            console.error('Error counting questions for tag:', countError)
            return {
              id: tag.id,
              name: tag.name,
              description: tag.description,
              count: 0,
            }
          }

          return {
            id: tag.id,
            name: tag.name,
            description: tag.description,
            count: count || 0,
          }
        })
      )

      // Sort by count if popular
      if (sortBy === 'popular') {
        tagsWithCounts.sort((a, b) => b.count - a.count)
      }

      return tagsWithCounts
    } catch (err) {
      console.error('Error in getAllTags:', err)
      return []
    }
  },

  async getQuestionsByTag(tagId: string): Promise<any[]> {
    try {
      // Get all question IDs with this tag
      const { data: questionTags, error: qtError } = await supabase
        .from('question_tags')
        .select('question_id')
        .eq('tag_id', tagId)

      if (qtError) {
        console.error('Error fetching questions for tag:', qtError)
        return []
      }

      if (!questionTags || questionTags.length === 0) {
        return []
      }

      const questionIds = questionTags.map((qt) => qt.question_id)

      // Fetch question details
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds)
        .order('created_at', { ascending: false })

      if (qError) {
        console.error('Error fetching question details:', qError)
        return []
      }

      if (!questions || questions.length === 0) {
        return []
      }

      // Enrich with full data
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

            // Fetch vote count
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

            const questionTags = (tagData || []).map((item: any) => ({
              id: item.tags.id,
              name: item.tags.name,
              count: 0,
            }))

            return {
              id: question.id,
              title: question.title,
              body: question.body,
              tags: questionTags,
              author,
              authorId: question.user_id,
              votes: voteCount,
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

      return questionsWithData.filter((q) => q !== null)
    } catch (err) {
      console.error('Error in getQuestionsByTag:', err)
      return []
    }
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

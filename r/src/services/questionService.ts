import type { Question, CreateQuestionInput, UpdateQuestionInput } from '../types/Question'
import { supabase } from '../lib/supabaseClient'
import { pollService } from './pollService'

export const questionService = {
  async getAllQuestions(sortBy: 'newest' | 'most-viewed' | 'most-liked' = 'newest'): Promise<Question[]> {
    console.log('Fetching all questions, sorted by:', sortBy)
    
    let query = supabase
      .from('questions')
      .select('*')

    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'most-viewed') {
      query = query.order('view_count', { ascending: false })
    }
    // For most-liked, we'll fetch all and sort client-side after calculating votes

    const { data: questions, error } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return []
    }

    if (!questions || questions.length === 0) {
      console.log('No questions found')
      return []
    }

    console.log(`Found ${questions.length} questions`)
    console.log('Question data sample:', questions[0])

    // Fetch full data for each question in parallel
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

          const author = user ? {
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
            poll: undefined,
          }
        } catch (err) {
          console.error(`Error processing question ${question.id}:`, err)
          return null
        }
      })
    )

    // Filter out any null results
    const validQuestions = questionsWithData.filter((q) => q !== null) as Question[]

    // Sort by most-liked if needed
    if (sortBy === 'most-liked') {
      validQuestions.sort((a, b) => b.votes - a.votes)
    }

    return validQuestions
  },

  async getQuestionById(id: string): Promise<Question | null> {
    console.log('Fetching question with id:', id)
    
    const { data: question, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching question:', error)
      return null
    }

    if (!question) {
      console.warn('Question not found with id:', id)
      return null
    }

    console.log('Question fetched:', question)

    // Fetch user separately
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', question.user_id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
    }

    console.log('User fetched:', user)

    // Fetch tags separately
    const { data: tagData, error: tagError } = await supabase
      .from('question_tags')
      .select('tags (*)')
      .eq('question_id', id)

    if (tagError) {
      console.error('Error fetching tags:', tagError)
    }

    console.log('Tags fetched:', tagData)

    // Fetch answer count separately
    const { count: answerCount, error: answerError } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', id)

    if (answerError) {
      console.error('Error fetching answer count:', answerError)
    }

    // Transform database format to app format
    const author = user ? {
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

    // Fetch poll if it exists
    let poll = undefined
    try {
      const pollResponse = await pollService.getPollByQuestionId(id)
      if (pollResponse?.data) {
        poll = pollResponse.data
      }
    } catch (error) {
      console.error('Error fetching poll:', error)
    }

    return {
      id: question.id,
      title: question.title,
      body: question.body,
      tags,
      author,
      authorId: question.user_id,
      votes: question.votes || 0,
      repostCount: question.repost_count || 0,
      answerCount: answerCount || 0,
      viewCount: question.view_count || 0,
      createdAt: question.created_at,
      updatedAt: question.updated_at,
      poll,
    }
  },

  async createQuestion(data: CreateQuestionInput): Promise<Question> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Ensure user profile exists in database
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      // If user doesn't exist, create profile
      if (!existingUser) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            username: user.email?.split('@')[0] || 'user',
            reputation: 0,
            bio: '',
            avatar_url: null,
          })
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
          throw new Error('Failed to create user profile: ' + profileError.message)
        }
      }
    } catch (error) {
      console.error('Error checking/creating user profile:', error)
      // Continue anyway, the profile might already exist
    }

    // Create the question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        user_id: user.id,
        title: data.title,
        body: data.body,
      })
      .select()
      .single()

    if (questionError) {
      console.error('Question creation error:', questionError)
      throw new Error('Failed to create question: ' + questionError.message)
    }
    if (!question) throw new Error('Failed to create question')

    // Create and link tags
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        try {
          // Try to get existing tag or create new one
          const { data: existingTag, error: lookupError } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .maybeSingle()  // Use maybeSingle to handle empty results gracefully

          let tagId: string
          if (existingTag) {
            tagId = existingTag.id
          } else {
            // Tag doesn't exist, create it
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: tagName })
              .select('id')
              .single()
            
            if (tagError) {
              console.error(`Tag creation error for "${tagName}":`, tagError)
              continue  // Skip this tag
            }
            if (!newTag) {
              console.warn(`Failed to create tag "${tagName}"`)
              continue
            }
            tagId = newTag.id
          }

          // Link tag to question
          const { error: linkError } = await supabase
            .from('question_tags')
            .insert({
              question_id: question.id,
              tag_id: tagId,
            })
          
          if (linkError) {
            console.warn(`Error linking tag "${tagName}":`, linkError)
          }
        } catch (tagErr) {
          console.error(`Error processing tag "${tagName}":`, tagErr)
          // Continue with next tag
        }
      }
    }

    // Create poll if poll options are provided
    if (data.pollOptions && data.pollOptions.length >= 2) {
      try {
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .insert({
            question_id: question.id,
          })
          .select()
          .single()

        if (pollError) {
          console.error('Error creating poll:', pollError)
        } else if (pollData) {
          // Create poll options
          const optionsToInsert = data.pollOptions.map((text) => ({
            poll_id: pollData.id,
            text: text,
            votes: 0,
          }))

          const { error: optionsError } = await supabase
            .from('poll_options')
            .insert(optionsToInsert)

          if (optionsError) {
            console.error('Error creating poll options:', optionsError)
          }
        }
      } catch (error) {
        console.error('Error creating poll:', error)
        // Continue anyway, question is already created
      }
    }

    // Return the created question with default values
    return {
      id: question.id,
      title: question.title,
      body: question.body,
      tags: data.tags.map((tagName) => ({
        id: '',
        name: tagName,
        count: 1,
      })),
      author: {
        id: user.id,
        username: user.user_metadata?.username || user.email || 'Anonymous',
        email: user.email || '',
        firstName: user.user_metadata?.firstName || '',
        lastName: user.user_metadata?.lastName || '',
        reputation: 0,
        bio: '',
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      authorId: user.id,
      votes: 0,
      repostCount: question.repost_count || 0,
      answerCount: 0,
      viewCount: 0,
      createdAt: question.created_at,
      updatedAt: question.updated_at,
    }
  },

  async updateQuestion(id: string, data: UpdateQuestionInput): Promise<Question> {
    // TODO: Implement with Supabase update
    console.log('Updating question', id, data)
    throw new Error('Not implemented yet')
  },

  async deleteQuestion(id: string): Promise<void> {
    try {
      // Delete question_tags first (foreign key dependency)
      const { error: tagsError } = await supabase
        .from('question_tags')
        .delete()
        .eq('question_id', id)

      if (tagsError) throw tagsError

      // Delete votes for this question
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('target_id', id)
        .eq('target_type', 'question')

      if (votesError) throw votesError

      // Delete the question itself
      const { error: questionError } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (questionError) throw questionError

      console.log('Question deleted successfully:', id)
    } catch (err) {
      console.error('Error deleting question:', err)
      throw err
    }
  },

  async searchQuestions(query: string, tags?: string[]): Promise<Question[]> {
    // TODO: Implement search with Supabase
    console.log('Searching questions:', query, tags)
    return []
  },
}

import { supabase } from '../lib/supabaseClient'
import type { Report, CreateReportInput, ReportStatus } from '../types/Report'
import type { AdminSetting, AdminSettingsInput } from '../types/AdminSettings'
import type { ActivityLog } from '../types/ActivityLog'
import type { UserProfile } from '../types/UserProfile'

export type ContentFilterStatus = 'all' | 'active' | 'reported'

export type AdminQuestionModerationItem = {
  id: string
  title: string
  authorId: string
  authorName: string
  createdAt: string
  votes: number
  tags: string[]
  answerCount: number
  isReported: boolean
}

export type AdminAnswerModerationItem = {
  id: string
  questionId: string
  body: string
  authorId: string
  authorName: string
  createdAt: string
  isReported: boolean
  reportCount: number
}

export type AdminReportedContentItem = {
  reportId: string
  targetId: string
  type: 'question' | 'answer'
  reason: string
  description?: string
  status: string
  createdAt: string
  reporterName: string
  authorName: string
  titleOrSnippet: string
}

type ContentFilters = {
  search?: string
  tag?: string
  userId?: string
  status?: ContentFilterStatus
}

class AdminService {
  // ===== USER MANAGEMENT =====
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data: data as UserProfile[], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async getUserById(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data: data as UserProfile, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async updateUserRole(userId: string, role: 'user' | 'moderator' | 'admin') {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await this.logActivity('USER_ROLE_CHANGED', 'user', userId, { newRole: role })

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned') {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await this.logActivity('USER_STATUS_CHANGED', 'user', userId, { newStatus: status })

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async searchUsers(query: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,email.ilike.%${query}%,first_name.ilike.%${query}%`)
        .limit(20)

      if (error) throw error
      return { data: data as UserProfile[], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // ===== QUESTION & ANSWER MANAGEMENT =====
  async getModerationFilterOptions() {
    try {
      const [{ data: users, error: usersError }, { data: tags, error: tagsError }] = await Promise.all([
        supabase.from('users').select('id, username').order('username', { ascending: true }),
        supabase.from('tags').select('id, name').order('name', { ascending: true }),
      ])

      if (usersError) throw usersError
      if (tagsError) throw tagsError

      return {
        data: {
          users: (users || []) as Array<{ id: string; username: string }>,
          tags: (tags || []) as Array<{ id: string; name: string }>,
        },
        error: null,
      }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async getQuestionsForModeration(filters: ContentFilters = {}) {
    try {
      let questionQuery = supabase
        .from('questions')
        .select('id, title, body, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(120)

      if (filters.search?.trim()) {
        const searchValue = filters.search.trim()
        questionQuery = questionQuery.or(`title.ilike.%${searchValue}%,body.ilike.%${searchValue}%`)
      }

      if (filters.userId) {
        questionQuery = questionQuery.eq('user_id', filters.userId)
      }

      const { data: questions, error: questionsError } = await questionQuery
      if (questionsError) throw questionsError
      if (!questions || questions.length === 0) {
        return { data: [] as AdminQuestionModerationItem[], error: null }
      }

      const questionIds = questions.map((q: any) => q.id)
      const userIds = [...new Set(questions.map((q: any) => q.user_id))]

      const [
        { data: users, error: usersError },
        { data: questionTags, error: tagsError },
        { data: answerRows, error: answersError },
        { data: voteRows, error: votesError },
        { data: reports, error: reportsError },
      ] = await Promise.all([
        supabase.from('users').select('id, username').in('id', userIds),
        supabase
          .from('question_tags')
          .select('question_id, tags(name)')
          .in('question_id', questionIds),
        supabase.from('answers').select('id, question_id').in('question_id', questionIds),
        supabase
          .from('votes')
          .select('target_id, vote_type')
          .eq('target_type', 'question')
          .in('target_id', questionIds),
        supabase
          .from('reports')
          .select('target_id, status')
          .eq('type', 'question')
          .in('target_id', questionIds)
          .in('status', ['pending', 'reviewed']),
      ])

      if (usersError) throw usersError
      if (tagsError) throw tagsError
      if (answersError) throw answersError
      if (votesError) throw votesError
      if (reportsError) throw reportsError

      const userMap = new Map((users || []).map((u: any) => [u.id, u.username || 'Unknown']))
      const tagsByQuestion = new Map<string, string[]>()
      for (const row of questionTags || []) {
        const existing = tagsByQuestion.get((row as any).question_id) || []
        const tagName = (row as any).tags?.name
        if (tagName) existing.push(tagName)
        tagsByQuestion.set((row as any).question_id, existing)
      }

      const answersCountByQuestion = new Map<string, number>()
      for (const answer of answerRows || []) {
        const key = (answer as any).question_id
        answersCountByQuestion.set(key, (answersCountByQuestion.get(key) || 0) + 1)
      }

      const votesByQuestion = new Map<string, number>()
      for (const vote of voteRows || []) {
        const key = (vote as any).target_id
        const voteType = Number((vote as any).vote_type) || 0
        votesByQuestion.set(key, (votesByQuestion.get(key) || 0) + voteType)
      }

      const reportedQuestionIds = new Set((reports || []).map((report: any) => report.target_id))

      let mapped = questions.map((question: any) => ({
        id: question.id,
        title: question.title,
        authorId: question.user_id,
        authorName: userMap.get(question.user_id) || 'Unknown',
        createdAt: question.created_at,
        votes: votesByQuestion.get(question.id) || 0,
        tags: tagsByQuestion.get(question.id) || [],
        answerCount: answersCountByQuestion.get(question.id) || 0,
        isReported: reportedQuestionIds.has(question.id),
      }))

      if (filters.tag?.trim()) {
        const tagFilter = filters.tag.trim().toLowerCase()
        mapped = mapped.filter((item) => item.tags.some((tag) => tag.toLowerCase() === tagFilter))
      }

      if (filters.status === 'reported') {
        mapped = mapped.filter((item) => item.isReported)
      }
      if (filters.status === 'active') {
        mapped = mapped.filter((item) => !item.isReported)
      }

      return { data: mapped as AdminQuestionModerationItem[], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async getAnswersForQuestionModeration(questionId: string) {
    try {
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('id, question_id, body, user_id, created_at')
        .eq('question_id', questionId)
        .order('created_at', { ascending: true })

      if (answersError) throw answersError
      if (!answers || answers.length === 0) {
        return { data: [] as AdminAnswerModerationItem[], error: null }
      }

      const answerIds = answers.map((answer: any) => answer.id)
      const userIds = [...new Set(answers.map((answer: any) => answer.user_id))]

      const [{ data: users, error: usersError }, { data: reports, error: reportsError }] = await Promise.all([
        supabase.from('users').select('id, username').in('id', userIds),
        supabase
          .from('reports')
          .select('target_id')
          .eq('type', 'answer')
          .in('target_id', answerIds)
          .in('status', ['pending', 'reviewed']),
      ])

      if (usersError) throw usersError
      if (reportsError) throw reportsError

      const userMap = new Map((users || []).map((u: any) => [u.id, u.username || 'Unknown']))
      const reportCountByAnswer = new Map<string, number>()
      for (const report of reports || []) {
        const key = (report as any).target_id
        reportCountByAnswer.set(key, (reportCountByAnswer.get(key) || 0) + 1)
      }

      const mapped = answers.map((answer: any) => ({
        id: answer.id,
        questionId: answer.question_id,
        body: answer.body,
        authorId: answer.user_id,
        authorName: userMap.get(answer.user_id) || 'Unknown',
        createdAt: answer.created_at,
        isReported: (reportCountByAnswer.get(answer.id) || 0) > 0,
        reportCount: reportCountByAnswer.get(answer.id) || 0,
      }))

      return { data: mapped as AdminAnswerModerationItem[], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async getReportedContent() {
    try {
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('id, type, target_id, reported_by_id, reason, description, status, created_at')
        .in('type', ['question', 'answer'])
        .in('status', ['pending', 'reviewed'])
        .order('created_at', { ascending: false })

      if (reportsError) throw reportsError
      if (!reports || reports.length === 0) {
        return { data: [] as AdminReportedContentItem[], error: null }
      }

      const questionIds = reports.filter((report: any) => report.type === 'question').map((report: any) => report.target_id)
      const answerIds = reports.filter((report: any) => report.type === 'answer').map((report: any) => report.target_id)

      const [{ data: questions }, { data: answers }, { data: reporters }] = await Promise.all([
        questionIds.length > 0
          ? supabase.from('questions').select('id, title, user_id').in('id', questionIds)
          : Promise.resolve({ data: [] as any[], error: null }),
        answerIds.length > 0
          ? supabase.from('answers').select('id, body, user_id').in('id', answerIds)
          : Promise.resolve({ data: [] as any[], error: null }),
        supabase
          .from('users')
          .select('id, username')
          .in('id', [...new Set(reports.map((report: any) => report.reported_by_id))]),
      ])

      const contentAuthorIds = [
        ...(questions || []).map((question: any) => question.user_id),
        ...(answers || []).map((answer: any) => answer.user_id),
      ]

      const { data: contentAuthors, error: authorsError } = await supabase
        .from('users')
        .select('id, username')
        .in('id', [...new Set(contentAuthorIds)])

      if (authorsError) throw authorsError

      const questionMap = new Map((questions || []).map((question: any) => [question.id, question]))
      const answerMap = new Map((answers || []).map((answer: any) => [answer.id, answer]))
      const reporterMap = new Map((reporters || []).map((u: any) => [u.id, u.username || 'Unknown']))
      const authorMap = new Map((contentAuthors || []).map((u: any) => [u.id, u.username || 'Unknown']))

      const mapped = reports.map((report: any) => {
        if (report.type === 'question') {
          const question = questionMap.get(report.target_id)
          return {
            reportId: report.id,
            targetId: report.target_id,
            type: 'question' as const,
            reason: report.reason,
            description: report.description || '',
            status: report.status,
            createdAt: report.created_at,
            reporterName: reporterMap.get(report.reported_by_id) || 'Unknown',
            authorName: authorMap.get(question?.user_id) || 'Unknown',
            titleOrSnippet: question?.title || 'Question unavailable',
          }
        }

        const answer = answerMap.get(report.target_id)
        return {
          reportId: report.id,
          targetId: report.target_id,
          type: 'answer' as const,
          reason: report.reason,
          description: report.description || '',
          status: report.status,
          createdAt: report.created_at,
          reporterName: reporterMap.get(report.reported_by_id) || 'Unknown',
          authorName: authorMap.get(answer?.user_id) || 'Unknown',
          titleOrSnippet: (answer?.body || 'Answer unavailable').slice(0, 180),
        }
      })

      return { data: mapped as AdminReportedContentItem[], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async getAllQuestions() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*, author:author_id(*), tags:question_tags(tag:tags(*))')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async deleteQuestion(questionId: string) {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      // Log activity
      await this.logActivity('QUESTION_DELETED', 'question', questionId)

      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  async deleteAnswer(answerId: string) {
    try {
      const { error } = await supabase
        .from('answers')
        .delete()
        .eq('id', answerId)

      if (error) throw error

      // Log activity
      await this.logActivity('ANSWER_DELETED', 'answer', answerId)

      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  // ===== REPORTS & MODERATION =====
  async getReports(status?: string) {
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data as Report[], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async createReport(input: CreateReportInput, userId: string) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          type: input.type,
          target_id: input.targetId,
          reported_by_id: userId,
          reason: input.reason,
          description: input.description,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async updateReportStatus(reportId: string, status: ReportStatus, resolutionNote?: string) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          status,
          resolution_note: resolutionNote,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', reportId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await this.logActivity('REPORT_UPDATED', 'report', reportId, { status })

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // ===== TAGS MANAGEMENT =====
  async getAllTags() {
    try {
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (tagsError) throw tagsError

      if (!tags || tags.length === 0) {
        return { data: [], error: null }
      }

      const { data: questionTags, error: questionTagsError } = await supabase
        .from('question_tags')
        .select('tag_id')

      if (questionTagsError) throw questionTagsError

      const tagQuestionCounts = (questionTags || []).reduce((acc: Record<string, number>, row: any) => {
        acc[row.tag_id] = (acc[row.tag_id] || 0) + 1
        return acc
      }, {})

      const tagsWithCounts = tags.map((tag: any) => ({
        ...tag,
        count: tagQuestionCounts[tag.id] || 0,
      }))

      return { data: tagsWithCounts, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async deleteTag(tagId: string) {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)

      if (error) throw error

      // Log activity
      await this.logActivity('TAG_DELETED', 'tag', tagId)

      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  // ===== ANALYTICS =====
  async getDashboardStats() {
    try {
      const { data: usersCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' })

      const { data: questionsCount } = await supabase
        .from('questions')
        .select('id', { count: 'exact' })

      const { data: answersCount } = await supabase
        .from('answers')
        .select('id', { count: 'exact' })

      const { data: reportsCount } = await supabase
        .from('reports')
        .select('id', { count: 'exact' })
        .eq('status', 'pending')

      return {
        totalUsers: usersCount?.length || 0,
        totalQuestions: questionsCount?.length || 0,
        totalAnswers: answersCount?.length || 0,
        pendingReports: reportsCount?.length || 0,
        error: null,
      }
    } catch (err) {
      return {
        totalUsers: 0,
        totalQuestions: 0,
        totalAnswers: 0,
        pendingReports: 0,
        error: err,
      }
    }
  }

  async getMostActiveUsers(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, reputation, created_at')
        .order('reputation', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async getMostAnsweredQuestions(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, title, answer_count')
        .order('answer_count', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // ===== ADMIN SETTINGS =====
  async getAllSettings() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('setting_key', { ascending: true })

      if (error) throw error
      return { data: data as AdminSetting[], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  async updateSetting(settingKey: string, settingValue: string) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ setting_value: settingValue, updated_at: new Date().toISOString() })
        .eq('setting_key', settingKey)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await this.logActivity('SETTING_UPDATED', 'setting', settingKey, { newValue: settingValue })

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  // ===== ACTIVITY LOGS =====
  async getActivityLogs(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data: data as ActivityLog[], error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  private async logActivity(
    action: string,
    targetType?: string,
    targetId?: string,
    details?: Record<string, any>
  ) {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) return

      await supabase.from('activity_logs').insert({
        admin_id: currentUser.user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details: details || {},
      })
    } catch (err) {
      console.error('Failed to log activity:', err)
    }
  }
}

export const adminService = new AdminService()

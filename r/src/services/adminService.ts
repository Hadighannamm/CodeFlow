import { supabase } from '../lib/supabaseClient'
import type { Report, CreateReportInput, ReportStatus } from '../types/Report'
import type { AdminSetting, AdminSettingsInput } from '../types/AdminSettings'
import type { ActivityLog } from '../types/ActivityLog'
import type { UserProfile } from '../types/UserProfile'

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

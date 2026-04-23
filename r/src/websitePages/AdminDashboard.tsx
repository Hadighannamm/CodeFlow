import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Users, FileText, AlertTriangle, Tag, Settings, Activity, Shield } from 'lucide-react'
import { useAuth } from '../customHooks/useAuth'
import { useToast } from '../customHooks/useToast'
import { adminService } from '../services/adminService'
import type {
  AdminAnswerModerationItem,
  AdminQuestionModerationItem,
  AdminReportedContentItem,
  ContentFilterStatus,
} from '../services/adminService'
import type { UserProfile } from '../types/UserProfile'
import type { Report } from '../types/Report'
import type { AdminSetting } from '../types/AdminSettings'
import type { ActivityLog } from '../types/ActivityLog'
import QuestionsModerationTable from '../components/admin/QuestionsModerationTable'
import ReportedContentSection from '../components/admin/ReportedContentSection'
import '../styles/pages/AdminDashboard.css'

type TabType = 'overview' | 'users' | 'content' | 'reports' | 'tags' | 'analytics' | 'settings' | 'logs'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, totalAnswers: 0, pendingReports: 0 })
  const [users, setUsers] = useState<UserProfile[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [settings, setSettings] = useState<AdminSetting[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [mostActiveUsers, setMostActiveUsers] = useState<UserProfile[]>([])
  const [mostAnsweredQuestions, setMostAnsweredQuestions] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [moderationQuestions, setModerationQuestions] = useState<AdminQuestionModerationItem[]>([])
  const [reportedContent, setReportedContent] = useState<AdminReportedContentItem[]>([])
  const [moderationUsers, setModerationUsers] = useState<Array<{ id: string; username: string }>>([])
  const [moderationTags, setModerationTags] = useState<Array<{ id: string; name: string }>>([])
  const [contentLoading, setContentLoading] = useState(false)
  const [answersLoadingQuestionIds, setAnswersLoadingQuestionIds] = useState<Set<string>>(new Set())
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set())
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, AdminAnswerModerationItem[]>>({})
  const [contentFilters, setContentFilters] = useState<{
    search: string
    tag: string
    userId: string
    status: ContentFilterStatus
  }>({
    search: '',
    tag: '',
    userId: '',
    status: 'all',
  })

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/auth')
        return
      }

      // Check if user is admin (role is stored at signup/profile level)
      // Since role is set at authentication level, we check if user has admin privileges
      // For now, allow access and let the service handle permission errors
      try {
        const { data: userData } = await adminService.getUserById(user.id)
        if (userData && (userData as any).role !== 'admin') {
          toast.error('Access denied. Admin privileges required.')
          navigate('/')
          return
        }
      } catch (err) {
        // If we can't fetch user data, check will happen at service level
        console.error('Error checking admin status:', err)
      }

      setIsLoading(false)
      loadDashboardData()
    }

    checkAdminAccess()
  }, [user, navigate, toast])

  useEffect(() => {
    if (activeTab === 'content') {
      loadContentData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, contentFilters.search, contentFilters.tag, contentFilters.userId, contentFilters.status])

  const loadDashboardData = async () => {
    try {
      const statsResult = await adminService.getDashboardStats()
      setStats(statsResult)

      const logsResult = await adminService.getActivityLogs(20)
      if (logsResult.data) setActivityLogs(logsResult.data)

      const mostActiveResult = await adminService.getMostActiveUsers(5)
      if (mostActiveResult.data) setMostActiveUsers(mostActiveResult.data as any)

      const mostAnsweredResult = await adminService.getMostAnsweredQuestions(5)
      if (mostAnsweredResult.data) setMostAnsweredQuestions(mostAnsweredResult.data)
    } catch (err) {
      console.error('Error loading dashboard:', err)
    }
  }

  const loadUsers = async () => {
    try {
      const result = await adminService.getAllUsers()
      if (result.data) setUsers(result.data)
    } catch (err) {
      toast.error('Failed to load users')
    }
  }

  const loadReports = async () => {
    try {
      const result = await adminService.getReports()
      if (result.data) setReports(result.data)
    } catch (err) {
      toast.error('Failed to load reports')
    }
  }

  const loadSettings = async () => {
    try {
      const result = await adminService.getAllSettings()
      if (result.data) setSettings(result.data)
    } catch (err) {
      toast.error('Failed to load settings')
    }
  }

  const loadTags = async () => {
    try {
      const result = await adminService.getAllTags()
      if (result.data) setTags(result.data)
    } catch (err) {
      toast.error('Failed to load tags')
    }
  }

  const loadContentData = async () => {
    try {
      setContentLoading(true)
      const [questionsResult, reportedResult, optionsResult] = await Promise.all([
        adminService.getQuestionsForModeration({
          search: contentFilters.search,
          tag: contentFilters.tag,
          userId: contentFilters.userId,
          status: contentFilters.status,
        }),
        adminService.getReportedContent(),
        adminService.getModerationFilterOptions(),
      ])

      if (questionsResult.data) setModerationQuestions(questionsResult.data)
      if (reportedResult.data) setReportedContent(reportedResult.data)
      if (optionsResult.data) {
        setModerationUsers(optionsResult.data.users)
        setModerationTags(optionsResult.data.tags)
      }
    } catch (err) {
      toast.error('Failed to load moderation content')
    } finally {
      setContentLoading(false)
    }
  }

  const handleToggleAnswers = async (questionId: string) => {
    const currentlyExpanded = expandedQuestionIds.has(questionId)
    if (currentlyExpanded) {
      const nextExpanded = new Set(expandedQuestionIds)
      nextExpanded.delete(questionId)
      setExpandedQuestionIds(nextExpanded)
      return
    }

    const nextExpanded = new Set(expandedQuestionIds)
    nextExpanded.add(questionId)
    setExpandedQuestionIds(nextExpanded)

    if (answersByQuestionId[questionId]) return

    try {
      const nextLoadingSet = new Set(answersLoadingQuestionIds)
      nextLoadingSet.add(questionId)
      setAnswersLoadingQuestionIds(nextLoadingSet)

      const result = await adminService.getAnswersForQuestionModeration(questionId)
      if (result.data) {
        setAnswersByQuestionId((prev) => ({ ...prev, [questionId]: result.data || [] }))
      }
    } catch (err) {
      toast.error('Failed to load answers for question')
    } finally {
      const nextLoadingSet = new Set(answersLoadingQuestionIds)
      nextLoadingSet.delete(questionId)
      setAnswersLoadingQuestionIds(nextLoadingSet)
    }
  }

  const handleDeleteQuestionModeration = async (questionId: string) => {
    const confirmed = window.confirm('Delete this question and all associated moderation entries?')
    if (!confirmed) return

    try {
      const result = await adminService.deleteQuestion(questionId)
      if (!result.error) {
        toast.success('Question deleted')
        loadContentData()
      } else {
        toast.error('Failed to delete question')
      }
    } catch (err) {
      toast.error('Failed to delete question')
    }
  }

  const handleDeleteAnswerModeration = async (answerId: string) => {
    const confirmed = window.confirm('Delete this answer?')
    if (!confirmed) return

    try {
      const result = await adminService.deleteAnswer(answerId)
      if (!result.error) {
        toast.success('Answer deleted')
        setAnswersByQuestionId((prev) => {
          const updated: Record<string, AdminAnswerModerationItem[]> = {}
          for (const [questionId, answers] of Object.entries(prev)) {
            updated[questionId] = answers.filter((answer) => answer.id !== answerId)
          }
          return updated
        })
        loadContentData()
      } else {
        toast.error('Failed to delete answer')
      }
    } catch (err) {
      toast.error('Failed to delete answer')
    }
  }

  const handleIgnoreReport = async (reportId: string) => {
    try {
      const result = await adminService.updateReportStatus(reportId, 'dismissed')
      if (!result.error) {
        toast.success('Report ignored')
        loadContentData()
      } else {
        toast.error('Failed to ignore report')
      }
    } catch (err) {
      toast.error('Failed to ignore report')
    }
  }

  const handleDeleteReportedContent = async (item: AdminReportedContentItem) => {
    const confirmed = window.confirm('Delete reported content and resolve the report?')
    if (!confirmed) return

    try {
      const deleteResult =
        item.type === 'question'
          ? await adminService.deleteQuestion(item.targetId)
          : await adminService.deleteAnswer(item.targetId)

      if (deleteResult.error) {
        toast.error('Failed to delete reported content')
        return
      }

      const reportResult = await adminService.updateReportStatus(item.reportId, 'resolved')
      if (reportResult.error) {
        toast.error('Content deleted but report status update failed')
        loadContentData()
        return
      }

      toast.success('Reported content deleted and report resolved')
      loadContentData()
    } catch (err) {
      toast.error('Failed to process report action')
    }
  }

  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    try {
      const result = await adminService.updateUserStatus(userId, newStatus)
      if (!result.error) {
        toast.success(`User status updated to ${newStatus}`)
        loadUsers()
      }
    } catch (err) {
      toast.error('Failed to update user status')
    }
  }

  const handleUserRoleChange = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    try {
      const result = await adminService.updateUserRole(userId, newRole)
      if (!result.error) {
        toast.success(`User role updated to ${newRole}`)
        loadUsers()
      } else {
        toast.error('Failed to update user role')
      }
    } catch (err) {
      toast.error('Failed to update user role')
    }
  }

  const handleReportResolution = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    try {
      const result = await adminService.updateReportStatus(reportId, newStatus)
      if (!result.error) {
        toast.success(`Report marked as ${newStatus}`)
        loadReports()
      }
    } catch (err) {
      toast.error('Failed to update report')
    }
  }

  const handleSettingUpdate = async (settingKey: string, newValue: string) => {
    try {
      const result = await adminService.updateSetting(settingKey, newValue)
      if (!result.error) {
        toast.success('Setting updated successfully')
        loadSettings()
      }
    } catch (err) {
      toast.error('Failed to update setting')
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        const result = await adminService.deleteTag(tagId)
        if (!result.error) {
          toast.success('Tag deleted successfully')
          loadTags()
        }
      } catch (err) {
        toast.error('Failed to delete tag')
      }
    }
  }

  if (isLoading) {
    return <div className="admin-dashboard-loading">Loading admin dashboard...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-title">
          <Shield size={32} />
          <h1>Admin Dashboard</h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('overview')
            loadDashboardData()
          }}
        >
          <BarChart3 size={20} />
          Overview
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users')
            loadUsers()
          }}
        >
          <Users size={20} />
          Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <FileText size={20} />
          Content
        </button>
        <button
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('reports')
            loadReports()
          }}
        >
          <AlertTriangle size={20} />
          Reports
        </button>
        <button
          className={`admin-tab ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('tags')
            loadTags()
          }}
        >
          <Tag size={20} />
          Tags
        </button>
        <button
          className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('analytics')
            loadDashboardData()
          }}
        >
          <BarChart3 size={20} />
          Analytics
        </button>
        <button
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('settings')
            loadSettings()
          }}
        >
          <Settings size={20} />
          Settings
        </button>
        <button
          className={`admin-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('logs')
            loadDashboardData()
          }}
        >
          <Activity size={20} />
          Activity
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="admin-section">
            <h2>Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon users-icon">
                  <Users size={32} />
                </div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon questions-icon">
                  <FileText size={32} />
                </div>
                <div className="stat-content">
                  <h3>Total Questions</h3>
                  <p className="stat-number">{stats.totalQuestions}</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon answers-icon">
                  <FileText size={32} />
                </div>
                <div className="stat-content">
                  <h3>Total Answers</h3>
                  <p className="stat-number">{stats.totalAnswers}</p>
                </div>
              </div>

              <div className="admin-stat-card alert">
                <div className="stat-icon reports-icon">
                  <AlertTriangle size={32} />
                </div>
                <div className="stat-content">
                  <h3>Pending Reports</h3>
                  <p className="stat-number">{stats.pendingReports}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="admin-section-box">
              <h3>Recent Activity</h3>
              <div className="activity-log-list">
                {activityLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="activity-log-item">
                    <div className="activity-log-action">{log.action}</div>
                    <div className="activity-log-time">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active Users & Most Answered Questions */}
            <div className="admin-grid-2">
              <div className="admin-section-box">
                <h3>Most Active Users</h3>
                <div className="user-list">
                  {mostActiveUsers.map((u: any) => (
                    <div key={u.id} className="user-item">
                      <div className="user-info">
                        <p className="user-name">{u.username}</p>
                        <p className="user-reputation">Reputation: {u.reputation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-section-box">
                <h3>Most Answered Questions</h3>
                <div className="question-list">
                  {mostAnsweredQuestions.map((q: any) => (
                    <div key={q.id} className="question-item">
                      <p className="question-title">{q.title}</p>
                      <p className="question-meta">{q.answer_count} answers</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>User Management</h2>
            <div className="users-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Reputation</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 50).map((u: any) => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.reputation}</td>
                      <td>
                        <select
                          value={(u as any).role || 'user'}
                          onChange={(e) => handleUserRoleChange(u.id, e.target.value as 'user' | 'moderator' | 'admin')}
                          className="admin-select"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${(u as any).status || 'active'}`}>
                          {(u as any).status || 'active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {(u as any).status !== 'suspended' && (
                            <button
                              onClick={() => handleUserStatusChange(u.id, 'suspended')}
                              className="btn-warning"
                            >
                              Suspend
                            </button>
                          )}
                          {(u as any).status !== 'active' && (
                            <button
                              onClick={() => handleUserStatusChange(u.id, 'active')}
                              className="btn-success"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="admin-section">
            <h2>Content Reports</h2>
            <div className="reports-container">
              {reports.length === 0 ? (
                <p className="no-data">No reports found</p>
              ) : (
                  reports.map((report) => (
                    <div key={report.id} className="report-card">
                      <div className="report-header">
                        <span className="report-type">{report.type}</span>
                      <span className={`report-status ${report.status}`}>{report.status}</span>
                    </div>
                    <div className="report-body">
                      <p>
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      {report.description && (
                        <p>
                          <strong>Description:</strong> {report.description}
                        </p>
                      )}
                      <p className="report-meta">
                        Reported on {new Date(report.createdAt || new Date()).toLocaleDateString()}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="report-actions">
                        <button
                          onClick={() => handleReportResolution(report.id, 'resolved')}
                          className="btn-success"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleReportResolution(report.id, 'dismissed')}
                          className="btn-secondary"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="admin-section">
            <h2>System Settings</h2>
            <div className="settings-container">
              {settings.map((setting) => (
                <div key={setting.id} className="setting-item">
                  <label>{setting.settingKey}</label>
                  <p className="setting-description">{setting.description}</p>
                  {setting.dataType === 'boolean' ? (
                    <select
                      value={setting.settingValue}
                      onChange={(e) =>
                        handleSettingUpdate(setting.settingKey, e.target.value)
                      }
                      className="admin-select"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  ) : (
                    <input
                      type={setting.dataType === 'number' ? 'number' : 'text'}
                      value={setting.settingValue}
                      onChange={(e) =>
                        handleSettingUpdate(setting.settingKey, e.target.value)
                      }
                      className="admin-input"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLACEHOLDER TABS */}
        {activeTab === 'content' && (
          <div className="admin-section">
            <h2>Content Moderation</h2>
            <div className="content-filter-grid">
              <div className="content-filter-item">
                <label htmlFor="content-search">Search</label>
                <input
                  id="content-search"
                  type="text"
                  className="admin-input"
                  placeholder="Search question title or body"
                  value={contentFilters.search}
                  onChange={(e) =>
                    setContentFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>

              <div className="content-filter-item">
                <label htmlFor="content-tag-filter">Filter By Tag</label>
                <select
                  id="content-tag-filter"
                  className="admin-select"
                  value={contentFilters.tag}
                  onChange={(e) =>
                    setContentFilters((prev) => ({ ...prev, tag: e.target.value }))
                  }
                >
                  <option value="">All Tags</option>
                  {moderationTags.map((tag) => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="content-filter-item">
                <label htmlFor="content-user-filter">Filter By User</label>
                <select
                  id="content-user-filter"
                  className="admin-select"
                  value={contentFilters.userId}
                  onChange={(e) =>
                    setContentFilters((prev) => ({ ...prev, userId: e.target.value }))
                  }
                >
                  <option value="">All Users</option>
                  {moderationUsers.map((filterUser) => (
                    <option key={filterUser.id} value={filterUser.id}>
                      {filterUser.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="content-filter-item">
                <label htmlFor="content-status-filter">Filter By Status</label>
                <select
                  id="content-status-filter"
                  className="admin-select"
                  value={contentFilters.status}
                  onChange={(e) =>
                    setContentFilters((prev) => ({
                      ...prev,
                      status: e.target.value as ContentFilterStatus,
                    }))
                  }
                >
                  <option value="all">All</option>
                  <option value="reported">Reported</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>

            {contentLoading ? (
              <p className="subtle-text">Loading moderation data...</p>
            ) : (
              <>
                <QuestionsModerationTable
                  questions={moderationQuestions}
                  answersByQuestionId={answersByQuestionId}
                  expandedQuestionIds={expandedQuestionIds}
                  answersLoadingQuestionIds={answersLoadingQuestionIds}
                  onToggleAnswers={handleToggleAnswers}
                  onDeleteQuestion={handleDeleteQuestionModeration}
                  onDeleteAnswer={handleDeleteAnswerModeration}
                />

                <ReportedContentSection
                  items={reportedContent}
                  onIgnoreReport={handleIgnoreReport}
                  onDeleteContent={handleDeleteReportedContent}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="admin-section">
            <h2>Tags Management</h2>
            <div className="users-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tag Name</th>
                    <th>Questions</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#6b7280' }}>
                        No tags found
                      </td>
                    </tr>
                  ) : (
                    tags.map((tag: any) => (
                      <tr key={tag.id}>
                        <td>
                          <strong>{tag.name}</strong>
                        </td>
                        <td>{tag.count || 0}</td>
                        <td>
                          {tag.created_at
                            ? new Date(tag.created_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleDeleteTag(tag.id)}
                              className="btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="admin-section">
            <h2>Analytics</h2>
            <p>Advanced analytics dashboard coming soon...</p>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="admin-section">
            <h2>Activity Logs</h2>
            <div className="activity-log-list">
              {activityLogs.map((log) => (
                <div key={log.id} className="activity-log-detailed">
                  <div className="log-action">{log.action}</div>
                  <div className="log-details">
                    {log.targetType && <span>{log.targetType}</span>}
                  </div>
                  <div className="log-time">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

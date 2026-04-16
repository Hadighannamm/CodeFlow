import { useState, useEffect } from 'react'
import { User, Trash2 } from 'lucide-react'
import { useAuth } from '../customHooks/useAuth'
import { profileService } from '../services/profileService'
import { questionService } from '../services/questionService'
import type { UserProfile } from '../types/UserProfile'
import '../styles/pages/ProfilePage.css'

interface UserQuestion {
  id: string
  title: string
  body: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [questionsCount, setQuestionsCount] = useState(0)
  const [answersCount, setAnswersCount] = useState(0)
  const [userQuestions, setUserQuestions] = useState<UserQuestion[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
  })

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser?.id) return

      setIsLoadingProfile(true)
      setError(null)

      const { data, error: profileError } = await profileService.getUserProfile(authUser.id)

      if (profileError || !data) {
        setError('Failed to load profile')
        setIsLoadingProfile(false)
        return
      }

      setUser(data)
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        username: data.username,
        bio: data.bio || '',
      })

      // Fetch counts and questions
      const qCount = await profileService.getUserQuestionsCount(authUser.id)
      const aCount = await profileService.getUserAnswersCount(authUser.id)
      setQuestionsCount(qCount)
      setAnswersCount(aCount)

      // Fetch recent questions
      setIsLoadingQuestions(true)
      const questions = await profileService.getUserQuestions(authUser.id, 5)
      setUserQuestions(questions)
      setIsLoadingQuestions(false)

      setIsLoadingProfile(false)
    }

    fetchProfile()
  }, [authUser?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !authUser?.id) return

    setIsUploadingAvatar(true)
    setError(null)

    const { url, error: uploadError } = await profileService.uploadAvatar(authUser.id, file)

    if (uploadError || !url) {
      setError(`Avatar upload failed: ${uploadError || 'Unknown error'}`)
      setIsUploadingAvatar(false)
      return
    }

    // Update local user state with new avatar
    if (user) {
      const updatedUser = { ...user, avatarUrl: url }
      setUser(updatedUser)
      console.log('Avatar updated successfully:', url)
    }
    setIsUploadingAvatar(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authUser?.id || !user) return

    setIsSaving(true)
    setError(null)

    const { data, error: updateError } = await profileService.updateUserProfile(authUser.id, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      bio: formData.bio,
    })

    if (updateError || !data) {
      console.error('Profile update error:', updateError)
      setError(`Failed to update profile: ${updateError?.message || 'Unknown error'}`)
      setIsSaving(false)
      return
    }

    setUser(data)
    setFormData({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      username: data.username,
      bio: data.bio || '',
    })
    setIsEditing(false)
    setError(null)
    setIsSaving(false)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return
    }

    try {
      await questionService.deleteQuestion(questionId)
      // Remove the question from the local state
      setUserQuestions((prev) => prev.filter((q) => q.id !== questionId))
      // Update the count
      setQuestionsCount((prev) => Math.max(0, prev - 1))
      setError(null)
    } catch (err) {
      console.error('Error deleting question:', err)
      setError(`Failed to delete question: ${(err as Error).message || 'Unknown error'}`)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="profile-page-container">
        <div className="profile-page-loading">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-page-container">
        <div className="profile-page-loading">
          <p>Failed to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-container">
      {error && (
        <div className="profile-page-error">
          {error}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="profile-card">
        <div className="profile-header">
          {/* Avatar Section - Left */}
          <div className="profile-avatar-section">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-default">
                <User className="profile-avatar-icon" />
              </div>
            )}
            {isEditing && (
              <label className="profile-avatar-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                  style={{ display: 'none' }}
                />
                <span>📷</span>
              </label>
            )}
            {isUploadingAvatar && (
              <div className="profile-avatar-uploading">
                <span>Uploading...</span>
              </div>
            )}
          </div>

          {/* User Info - Right */}
          <div className="profile-info">
            <div className="profile-info-header">
              <div className="profile-info-details">
                <h1>{user.username}</h1>
                {(user.firstName || user.lastName) && (
                  <p className="profile-info-name">
                    {user.firstName} {user.lastName}
                  </p>
                )}
                <p className="profile-info-email">{user.email}</p>
                {user.bio && (
                  <p className="profile-info-bio">{user.bio}</p>
                )}
                <p className="profile-info-member">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="profile-edit-button"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat-item">
            <div className="profile-stat-value reputation">{user.reputation}</div>
            <div className="profile-stat-label">Reputation</div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value questions">{questionsCount}</div>
            <div className="profile-stat-label">Questions</div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value answers">{answersCount}</div>
            <div className="profile-stat-label">Answers</div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="profile-edit-form-container">
          <h2 className="profile-edit-form-title">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="profile-edit-form">
            {/* Name Fields */}
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label className="profile-form-label">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="profile-form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="profile-form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Username Field */}
            <div className="profile-form-group">
              <label className="profile-form-label">
                Username
              </label>
              <input
                type="text"
                name="username"
                className="profile-form-input"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Bio Field */}
            <div className="profile-form-group">
              <label className="profile-form-label">
                Bio
              </label>
              <textarea
                name="bio"
                className="profile-form-textarea"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Action Buttons */}
            <div className="profile-form-actions">
              <button
                type="submit"
                disabled={isSaving || isUploadingAvatar}
                className="profile-button-submit"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving || isUploadingAvatar}
                className="profile-button-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activity Section */}
      <div className="profile-activity-section">
        {/* Recent Questions */}
        <div className="profile-activity-card">
          <h3 className="profile-activity-title">Recent Questions</h3>
          {isLoadingQuestions ? (
            <p className="profile-empty-message">Loading...</p>
          ) : userQuestions.length > 0 ? (
            <div className="profile-activity-list">
              {userQuestions.map((q) => (
                <div key={q.id} className="profile-question-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 className="profile-question-title">
                        {q.title}
                      </h4>
                      <div className="profile-question-meta">
                        <span>{new Date(q.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile-empty-message">No questions yet</p>
          )}
        </div>

        {/* Recent Answers */}
        <div className="profile-activity-card">
          <h3 className="profile-activity-title">Recent Answers</h3>
          <div className="profile-activity-list">
            <p className="profile-empty-message">No answers yet</p>
          </div>
        </div>
      </div>
    </div>
  )
}

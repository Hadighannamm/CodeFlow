import { useState } from 'react'
import type { UserProfile } from '../types/UserProfile'

// Mock user - will be replaced with auth context
const mockUser: UserProfile = {
  id: '1',
  username: 'johndoe',
  email: 'john@example.com',
  reputation: 850,
  bio: 'Passionate developer and JavaScript enthusiast',
  avatar: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Update user profile via API
    setUser((prev) => ({
      ...prev,
      username: formData.username,
      bio: formData.bio,
    }))
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-2">
              Member since{' '}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary ml-auto"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{user.reputation}</div>
            <div className="text-sm text-gray-500">Reputation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-500">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">8</div>
            <div className="text-sm text-gray-500">Answers</div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                className="input"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                className="textarea h-24"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Questions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Questions</h3>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">No questions yet</p>
          </div>
        </div>

        {/* Recent Answers */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Answers</h3>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">No answers yet</p>
          </div>
        </div>
      </div>
    </div>
  )
}

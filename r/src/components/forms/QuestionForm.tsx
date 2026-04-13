import { useState } from 'react'
import type { CreateQuestionInput } from '../../types/Question'

type QuestionFormProps = {
  onSubmit: (data: CreateQuestionInput) => Promise<void>
  isLoading?: boolean
  initialData?: CreateQuestionInput
}

export default function QuestionForm({
  onSubmit,
  isLoading = false,
  initialData,
}: QuestionFormProps) {
  const [formData, setFormData] = useState<CreateQuestionInput>(
    initialData || {
      title: '',
      body: '',
      tags: [],
    }
  )
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.body.trim()) {
      setError('Description is required')
      return
    }
    if (formData.tags.length === 0) {
      setError('At least one tag is required')
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      setError((err as Error).message || 'Failed to submit question')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Title
        </label>
        <input
          type="text"
          className="input"
          placeholder="What is your question?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Be specific and descriptive about your question
        </p>
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Question Details
        </label>
        <textarea
          className="textarea h-40"
          placeholder="Provide more context for your question..."
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Include code snippets, error messages, or any relevant details
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            className="input"
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="btn-secondary"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <div key={tag} className="badge-primary flex items-center gap-2">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-blue-800 hover:text-blue-900 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Add up to 5 relevant tags (e.g., javascript, react, bugs)
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50"
        >
          {isLoading ? 'Publishing...' : 'Publish Question'}
        </button>
        <button
          type="reset"
          className="btn-secondary"
        >
          Clear
        </button>
      </div>
    </form>
  )
}

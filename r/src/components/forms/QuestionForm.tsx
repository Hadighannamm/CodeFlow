import { useState } from 'react'
import type { CreateQuestionInput } from '../../types/Question'
import './QuestionForm.css'

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
    <form onSubmit={handleSubmit} className="question-form">
      {error && (
        <div className="question-form-error">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="question-form-group">
        <label className="question-form-label">
          Question Title
        </label>
        <input
          type="text"
          className="question-form-input"
          placeholder="What is your question?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <p className="question-form-help">
          Be specific and descriptive about your question
        </p>
      </div>

      {/* Body */}
      <div className="question-form-group">
        <label className="question-form-label">
          Question Details
        </label>
        <textarea
          className="question-form-textarea"
          placeholder="Provide more context for your question..."
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        />
        <p className="question-form-help">
          Include code snippets, error messages, or any relevant details
        </p>
      </div>

      {/* Tags */}
      <div className="question-form-group">
        <label className="question-form-label">
          Tags
        </label>
        <div className="question-form-tag-input-wrapper">
          <input
            type="text"
            className="question-form-input"
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
        <div className="question-form-tags">
          {formData.tags.map((tag) => (
            <div key={tag} className="question-form-tag">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="question-form-tag-remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <p className="question-form-help">
          Add up to 5 relevant tags (e.g., javascript, react, bugs)
        </p>
      </div>

      {/* Submit */}
      <div className="question-form-actions">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
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

import { useState } from 'react'

type AnswerFormProps = {
  onSubmit: (body: string) => Promise<void>
  isLoading?: boolean
}

export default function AnswerForm({
  onSubmit,
  isLoading = false,
}: AnswerFormProps) {
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!body.trim()) {
      setError('Please provide an answer')
      return
    }

    try {
      await onSubmit(body)
      setBody('')
    } catch (err) {
      setError((err as Error).message || 'Failed to submit answer')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Answer
        </label>
        <textarea
          className="textarea h-40"
          placeholder="Share your solution or insights..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary disabled:opacity-50"
      >
        {isLoading ? 'Posting...' : 'Post Answer'}
      </button>
    </form>
  )
}

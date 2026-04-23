import { useState } from 'react'
import { useToast } from '../../customHooks/useToast'

type AnswerFormProps = {
  onSubmit: (body: string) => Promise<void>
  isLoading?: boolean
}

export default function AnswerForm({
  onSubmit,
  isLoading = false,
}: AnswerFormProps) {
  const [body, setBody] = useState('')
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!body.trim()) {
      toast.warning('Please provide an answer')
      return
    }

    try {
      await onSubmit(body)
      setBody('')
      toast.success('Answer posted successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit answer'
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

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

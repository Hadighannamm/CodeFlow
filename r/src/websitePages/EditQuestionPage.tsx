import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Question, UpdateQuestionInput } from '../types/Question'
import QuestionForm from '../components/forms/QuestionForm'

export default function EditQuestionPage() {
  const { id } = useParams<{ id: string }>()
  const _navigate = useNavigate()
  const [question, _setQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch question from API
    setIsLoading(false)
  }, [id])

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">Loading question...</div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Question not found</div>
      </div>
    )
  }

  const handleSubmit = async (data: UpdateQuestionInput) => {
    // TODO: Call API to update question
    console.log('Updating question:', id, data)
    // navigate(`/question/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Question</h1>
        <p className="text-gray-600">Update your question or add more details</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <QuestionForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={{
            title: question.title,
            body: question.body,
            tags: question.tags.map((t) => t.name),
          }}
        />
      </div>
    </div>
  )
}

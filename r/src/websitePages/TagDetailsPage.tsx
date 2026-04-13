import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Tag } from '../types/Tag'
import type { Question } from '../types/Question'
import QuestionCard from '../components/dataDisplay/QuestionCard'

export default function TagDetailsPage() {
  const { tag } = useParams<{ tag: string }>()
  const [tagData, _setTagData] = useState<Tag | null>(null)
  const [questions, _setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch tag and related questions from API
    setIsLoading(false)
  }, [tag])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading tag...</div>
      </div>
    )
  }

  if (!tagData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Tag not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tag Header */}
      <div className="mb-8">
        <div className="mb-4">
          <span className="badge-primary text-xl">
            {tagData.name}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Questions tagged with {tagData.name}
        </h1>
        {tagData.description && (
          <p className="text-gray-600 mb-4">{tagData.description}</p>
        )}
        <p className="text-gray-600">{questions.length} questions</p>
      </div>

      {/* Questions */}
      {questions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No questions with this tag yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  )
}

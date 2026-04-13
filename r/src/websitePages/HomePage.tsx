import { useEffect, useState } from 'react'
import type { Question } from '../types/Question'
import QuestionCard from '../components/dataDisplay/QuestionCard'

export default function HomePage() {
  const [questions, _setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'hot' | 'votes'>('newest')

  useEffect(() => {
    // TODO: Fetch questions from API
    setIsLoading(false)
  }, [sortBy])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading questions...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
          <p className="text-gray-600 mt-2">{questions.length} questions</p>
        </div>
        <div className="flex gap-2">
          {(['newest', 'hot', 'votes'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={sortBy === sort ? 'btn-primary' : 'btn-secondary'}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No questions yet</p>
          <p className="text-sm text-gray-400">Be the first to ask a question!</p>
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

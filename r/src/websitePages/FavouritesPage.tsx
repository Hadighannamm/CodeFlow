import { useState } from 'react'
import type { Question } from '../types/Question'
import QuestionCard from '../components/dataDisplay/QuestionCard'

export default function FavouritesPage() {
  const [savedQuestions] = useState<Question[]>([])
  const [isLoading] = useState(false)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Questions</h1>
        <p className="text-gray-600 mt-2">{savedQuestions.length} saved questions</p>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : savedQuestions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">You haven't saved any questions yet</p>
          <p className="text-sm text-gray-400">
            Questions you save will appear here for easy access
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  )
}

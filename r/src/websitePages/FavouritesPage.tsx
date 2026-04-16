import { useEffect, useState } from 'react'
import type { Question } from '../types/Question'
import QuestionCard from '../components/dataDisplay/QuestionCard'
import { savedQuestionService } from '../services/savedQuestionService'
import { useAuth } from '../customHooks/useAuth'

export default function FavouritesPage() {
  const { user } = useAuth()
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSavedQuestions = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError('')
        const questions = await savedQuestionService.getSavedQuestions(user.id)
        setSavedQuestions(questions)
      } catch (err) {
        setError((err as Error).message || 'Failed to load saved questions')
        console.error('Error fetching saved questions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedQuestions()
  }, [user])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Questions</h1>
        <p className="text-gray-600 mt-2">{savedQuestions.length} saved questions</p>
      </div>

      {!user ? (
        <div className="text-center py-12 bg-[#f5f5f0] rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">You must be logged in to view saved questions</p>
        </div>
      ) : isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      ) : savedQuestions.length === 0 ? (
        <div className="text-center py-12 bg-[#f5f5f0] rounded-lg border border-gray-200">
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

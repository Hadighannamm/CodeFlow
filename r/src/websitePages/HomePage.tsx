import { useEffect, useState } from 'react'
import type { Question } from '../types/Question'
import QuestionCard from '../components/dataDisplay/QuestionCard'
import { questionService } from '../services/questionService'
import '../styles/pages/HomePage.css'

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'hot' | 'votes'>('newest')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true)
        setError('')
        const fetchedQuestions = await questionService.getAllQuestions(sortBy)
        setQuestions(fetchedQuestions)
      } catch (err) {
        setError((err as Error).message || 'Failed to load questions')
        console.error('Error fetching questions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [sortBy])

  if (isLoading) {
    return (
      <div className="home-page-container">
        <div className="home-page-loading">Loading questions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="home-page-container">
        <div className="home-page-error">{error}</div>
      </div>
    )
  }

  return (
    <div className="home-page-container">
      {/* Header */}
      <div className="home-page-header">
        <div className="home-page-title-section">
          <h1>All Questions</h1>
          <p>{questions.length} questions</p>
        </div>
        <div className="home-page-sort-buttons">
          {(['newest', 'hot', 'votes'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={sortBy === sort ? 'sort-button active' : 'sort-button inactive'}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="home-page-empty">
          <p>No questions yet</p>
          <p>Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="home-page-questions-list">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  )
}

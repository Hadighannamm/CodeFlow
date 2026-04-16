import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { Question } from '../types/Question'
import QuestionCard from '../components/dataDisplay/QuestionCard'
import { questionService } from '../services/questionService'
import '../styles/pages/HomePage.css'

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'most-viewed' | 'most-liked'>('newest')
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

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
  }, [sortBy, location])

  // Filter questions based on search query
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const search = params.get('search') || ''
    setSearchQuery(search)

    if (search.trim()) {
      const filtered = questions.filter(
        (question) =>
          question.title.toLowerCase().includes(search.toLowerCase()) ||
          question.body.toLowerCase().includes(search.toLowerCase()) ||
          question.tags.some((tag) =>
            tag.name.toLowerCase().includes(search.toLowerCase())
          )
      )
      setFilteredQuestions(filtered)
    } else {
      setFilteredQuestions(questions)
    }
  }, [questions, location.search])

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
          <p>
            {searchQuery
              ? `${filteredQuestions.length} results for "${searchQuery}"`
              : `${questions.length} questions`}
          </p>
        </div>
        <div className="home-page-sort-buttons">
          {(['newest', 'most-viewed', 'most-liked'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={sortBy === sort ? 'sort-button active' : 'sort-button inactive'}
            >
              {sort === 'newest' && 'Newest'}
              {sort === 'most-viewed' && 'Most Viewed'}
              {sort === 'most-liked' && 'Most Liked'}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="home-page-empty">
          <p>
            {searchQuery
              ? `No questions found matching "${searchQuery}"`
              : 'No questions yet'}
          </p>
          <p>
            {!searchQuery && 'Be the first to ask a question!'}
          </p>
        </div>
      ) : (
        <div className="home-page-questions-list">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import type { Tag } from '../types/Tag'
import type { Question } from '../types/Question'
import { tagService } from '../services/tagService'
import QuestionCard from '../components/dataDisplay/QuestionCard'
import '../styles/pages/TagsPage.css'

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'popular' | 'new'>('popular')
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [selectedTagQuestions, setSelectedTagQuestions] = useState<Question[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true)
        setError('')
        const fetchedTags = await tagService.getAllTags(sortBy)
        setTags(fetchedTags)
      } catch (err) {
        setError((err as Error).message || 'Failed to load tags')
        console.error('Error fetching tags:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [sortBy])

  const handleTagClick = async (tag: Tag) => {
    setSelectedTag(tag)
    setIsLoadingQuestions(true)

    try {
      const questions = await tagService.getQuestionsByTag(tag.id)
      setSelectedTagQuestions(questions)
    } catch (err) {
      console.error('Error fetching questions for tag:', err)
      setSelectedTagQuestions([])
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const handleBackToTags = () => {
    setSelectedTag(null)
    setSelectedTagQuestions([])
  }

  if (isLoading) {
    return (
      <div className="tags-page-container">
        <div className="tags-page-detail-loading">Loading tags...</div>
      </div>
    )
  }

  if (selectedTag) {
    return (
      <div className="tags-page-detail-container">
        <div className="tags-page-detail-header">
          <button
            onClick={handleBackToTags}
            className="tags-page-detail-back-btn"
          >
            ← Back to Tags
          </button>
          <h1 className="tags-page-detail-title">
            <span className="tags-page-detail-title-badge">
              {selectedTag.name}
            </span>
          </h1>
          <p className="tags-page-detail-count">
            {selectedTagQuestions.length} {selectedTagQuestions.length === 1 ? 'question' : 'questions'}
          </p>
        </div>

        {isLoadingQuestions ? (
          <div className="tags-page-detail-loading">Loading questions...</div>
        ) : error ? (
          <div className="tags-page-detail-error">{error}</div>
        ) : selectedTagQuestions.length === 0 ? (
          <div className="tags-page-detail-empty">
            <p>No questions found with this tag</p>
          </div>
        ) : (
          <div className="tags-page-detail-questions">
            {selectedTagQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="tags-page-container">
      <div className="tags-page-header">
        <div className="tags-page-header-content">
          <h1>Tags</h1>
          <p>{tags.length} tags total</p>
        </div>
        <div className="tags-page-sort-buttons">
          {(['popular', 'new'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`tags-page-sort-btn ${sortBy === sort ? 'active' : ''}`}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="tags-page-error">{error}</div>
      )}

      {tags.length === 0 ? (
        <div className="tags-page-empty">
          <p>No tags yet</p>
        </div>
      ) : (
        <div className="tags-page-list">
          {tags.map((tag) => (
            <div 
              key={tag.id}
              onClick={() => handleTagClick(tag)}
              className="tags-page-card"
            >
              <div className="tags-page-card-left">
                <span className="tags-page-tag-badge">
                  {tag.name}
                </span>
              </div>
              <div className="tags-page-card-right">
                <div className="tags-page-info-group">
                  <span className="tags-page-info-label">Questions:</span>
                  <span className="tags-page-count-badge">
                    {tag.count}
                  </span>
                </div>
                <div className="tags-page-info-group">
                  <span className="tags-page-status-indicator"></span>
                  <span className="tags-page-status-text">Active</span>
                </div>
                <svg className="tags-page-action-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H9.5V3h1V1.5zM10.5 17h-1v1.5h1V17zM1.5 9.5H3v1H1.5zM17 9.5h1.5v1H17z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Question } from '../types/Question'
import QuestionCard from '../components/dataDisplay/QuestionCard'
import '../styles/pages/ExplorePage.css'

export default function ExplorePage() {
  const [questions, _setQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [isLoading, _setIsLoading] = useState(false)

  const popularTags = ['javascript', 'react', 'python', 'typescript', 'css']
  const sortOptions = ['newest', 'trending', 'unanswered']

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Search/filter questions
  }

  return (
    <div className="explore-page-wrapper">
      <div className="explore-page-header">
        <h1>Explore Questions</h1>
      </div>

      <div className="explore-page-layout">
        {/* Filters Sidebar */}
        <aside className="explore-page-sidebar">
          <div className="explore-page-filters">
            <h3 className="explore-page-filters-title">Filters</h3>

            {/* Popular Tags */}
            <div className="explore-page-filter-section">
              <p className="explore-page-filter-label">Popular Tags</p>
              <div className="explore-page-tag-list">
                {popularTags.map((tag) => (
                  <label key={tag} className="explore-page-tag-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="explore-page-divider" />

            {/* Sort Options */}
            <div className="explore-page-filter-section">
              <p className="explore-page-filter-label">Sort By</p>
              <div className="explore-page-sort-list">
                {sortOptions.map((option) => (
                  <label key={option} className="explore-page-sort-radio">
                    <input
                      type="radio"
                      name="sort"
                      value={option}
                      checked={sortBy === option}
                      onChange={(e) => setSortBy(e.target.value)}
                    />
                    <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Questions Content */}
        <main className="explore-page-content">
          <div className="explore-page-search">
            <form onSubmit={handleSearch} className="explore-page-search-form">
              <Search className="explore-page-search-icon" size={20} />
              <input
                type="text"
                className="explore-page-search-input"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>

          {isLoading ? (
            <div className="explore-page-loading">
              <p>Loading...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="explore-page-empty">
              <p className="explore-page-empty-title">No questions found</p>
              <p className="explore-page-empty-subtitle">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="explore-page-questions">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

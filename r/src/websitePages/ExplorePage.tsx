import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Question } from '../types/Question'
import QuestionCard from '../components/dataDisplay/QuestionCard'

export default function ExplorePage() {
  const [questions, _setQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, _setIsLoading] = useState(false)

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Explore Questions</h1>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

            {/* Popular Tags */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Popular Tags</p>
              {['javascript', 'react', 'python', 'typescript', 'css'].map((tag) => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 capitalize">{tag}</span>
                </label>
              ))}
            </div>

            <hr className="my-4" />

            {/* Filter Options */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Sort By</p>
              {['Newest', 'Trending', 'Unanswered'].map((sort) => (
                <label key={sort} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    className="w-4 h-4 rounded-full border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{sort}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="md:col-span-3">
          <div className="mb-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>

          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No questions found</p>
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

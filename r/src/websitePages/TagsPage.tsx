import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Tag } from '../types/Tag'

export default function TagsPage() {
  const [tags, _setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'popular' | 'new'>('popular')

  useEffect(() => {
    // TODO: Fetch tags from API
    setIsLoading(false)
  }, [sortBy])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading tags...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-2">{tags.length} tags total</p>
        </div>
        <div className="flex gap-2">
          {(['popular', 'new'] as const).map((sort) => (
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

      {tags.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tags yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/explore?tag=${tag.name}`}
              className="card hover:border-blue-400"
            >
              <div className="mb-3">
                <span className="badge-primary text-lg">
                  {tag.name}
                </span>
              </div>
              {tag.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {tag.description}
                </p>
              )}
              <div className="text-xs text-gray-500">
                {tag.count} questions
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

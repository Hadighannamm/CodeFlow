import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { Question } from '../types/Question'
import QuestionCard from '../components/dataDisplay/QuestionCard'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../customHooks/useAuth'
import '../styles/pages/ExplorePage.css'

type TagWithCount = {
  id: string
  name: string
  count: number
}

export default function ExplorePage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [tags, setTags] = useState<TagWithCount[]>([])
  const [trendingQuestions, setTrendingQuestions] = useState<Question[]>([])
  const [recommendedQuestions, setRecommendedQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [onlyUnanswered, setOnlyUnanswered] = useState(false)
  const [onlyMostVoted, setOnlyMostVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tagNameById = useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag.name])),
    [tags]
  )

  const loadExploreData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [
        questionsResult,
        questionTagsResult,
        answersResult,
        votesResult,
      ] = await Promise.all([
        supabase
          .from('questions')
          .select('id, title, body, user_id, view_count, repost_count, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('question_tags')
          .select('question_id, tag_id, tags(id, name)'),
        supabase
          .from('answers')
          .select('id, question_id, user_id, created_at'),
        supabase
          .from('votes')
          .select('target_id, target_type, vote_type, user_id, created_at')
          .eq('target_type', 'question'),
      ])

      if (questionsResult.error) throw questionsResult.error
      if (questionTagsResult.error) throw questionTagsResult.error
      if (answersResult.error) throw answersResult.error
      if (votesResult.error) throw votesResult.error

      const rawQuestions = questionsResult.data || []
      const questionTags = questionTagsResult.data || []
      const rawAnswers = answersResult.data || []
      const rawVotes = votesResult.data || []

      const userIds = Array.from(new Set(rawQuestions.map((q) => q.user_id)))

      const usersResult = userIds.length > 0
        ? await supabase
            .from('users')
            .select('id, username, email, first_name, last_name, reputation, bio, avatar_url, created_at, updated_at')
            .in('id', userIds)
        : { data: [], error: null }

      if (usersResult.error) throw usersResult.error

      const authorMap = new Map(
        (usersResult.data || []).map((u: any) => [
          u.id,
          {
            id: u.id,
            username: u.username || 'Unknown',
            email: u.email || '',
            firstName: u.first_name || '',
            lastName: u.last_name || '',
            reputation: u.reputation || 0,
            bio: u.bio || '',
            avatarUrl: u.avatar_url,
            createdAt: u.created_at,
            updatedAt: u.updated_at,
          },
        ])
      )

      const tagsByQuestionId = new Map<string, Array<{ id: string; name: string; count: number }>>()
      const tagQuestionCountMap = new Map<string, number>()
      const tagNameMap = new Map<string, string>()

      questionTags.forEach((item: any) => {
        const tagId = item.tag_id
        const tagName = item.tags?.name
        const questionId = item.question_id

        if (!tagId || !questionId || !tagName) return

        tagNameMap.set(tagId, tagName)
        tagQuestionCountMap.set(tagId, (tagQuestionCountMap.get(tagId) || 0) + 1)

        const list = tagsByQuestionId.get(questionId) || []
        list.push({ id: tagId, name: tagName, count: 0 })
        tagsByQuestionId.set(questionId, list)
      })

      const answerCountByQuestionId = new Map<string, number>()
      rawAnswers.forEach((answer: any) => {
        answerCountByQuestionId.set(
          answer.question_id,
          (answerCountByQuestionId.get(answer.question_id) || 0) + 1
        )
      })

      const voteCountByQuestionId = new Map<string, number>()
      rawVotes.forEach((vote: any) => {
        const voteValue = parseInt(vote.vote_type, 10)
        voteCountByQuestionId.set(
          vote.target_id,
          (voteCountByQuestionId.get(vote.target_id) || 0) + (isNaN(voteValue) ? 0 : voteValue)
        )
      })

      const hydratedQuestions: Question[] = rawQuestions.map((question: any) => {
        const author = authorMap.get(question.user_id) || {
          id: question.user_id,
          username: 'Unknown',
          email: '',
          firstName: '',
          lastName: '',
          reputation: 0,
          bio: '',
          avatarUrl: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return {
          id: question.id,
          title: question.title,
          body: question.body,
          tags: tagsByQuestionId.get(question.id) || [],
          author,
          authorId: question.user_id,
          votes: voteCountByQuestionId.get(question.id) || 0,
          repostCount: question.repost_count || 0,
          answerCount: answerCountByQuestionId.get(question.id) || 0,
          viewCount: question.view_count || 0,
          createdAt: question.created_at,
          updatedAt: question.updated_at,
        }
      })

      const tagsWithCount: TagWithCount[] = Array.from(tagQuestionCountMap.entries())
        .map(([id, count]) => ({
          id,
          count,
          name: tagNameMap.get(id) || 'Unknown',
        }))
        .sort((a, b) => b.count - a.count)

      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const recentAnswersByQuestionId = new Map<string, number>()
      rawAnswers.forEach((answer: any) => {
        if (new Date(answer.created_at).getTime() >= oneWeekAgo) {
          recentAnswersByQuestionId.set(
            answer.question_id,
            (recentAnswersByQuestionId.get(answer.question_id) || 0) + 1
          )
        }
      })

      const recentVotesByQuestionId = new Map<string, number>()
      rawVotes.forEach((vote: any) => {
        if (new Date(vote.created_at).getTime() >= oneWeekAgo) {
          recentVotesByQuestionId.set(
            vote.target_id,
            (recentVotesByQuestionId.get(vote.target_id) || 0) + 1
          )
        }
      })

      const trending = [...hydratedQuestions]
        .sort((a, b) => {
          const scoreA = (recentAnswersByQuestionId.get(a.id) || 0) * 5 + (recentVotesByQuestionId.get(a.id) || 0) * 3 + Math.min(a.viewCount, 200) * 0.05
          const scoreB = (recentAnswersByQuestionId.get(b.id) || 0) * 5 + (recentVotesByQuestionId.get(b.id) || 0) * 3 + Math.min(b.viewCount, 200) * 0.05
          return scoreB - scoreA
        })
        .slice(0, 5)

      let recommended: Question[] = []
      if (user) {
        const authoredQuestionIds = new Set(
          rawQuestions.filter((q: any) => q.user_id === user.id).map((q: any) => q.id)
        )

        const answeredQuestionIds = new Set(
          rawAnswers.filter((a: any) => a.user_id === user.id).map((a: any) => a.question_id)
        )

        const votedQuestionIds = new Set(
          rawVotes.filter((v: any) => v.user_id === user.id).map((v: any) => v.target_id)
        )

        const interactedQuestionIds = new Set<string>([
          ...Array.from(authoredQuestionIds),
          ...Array.from(answeredQuestionIds),
          ...Array.from(votedQuestionIds),
        ])

        const preferredTagScores = new Map<string, number>()
        interactedQuestionIds.forEach((questionId) => {
          const questionTagsList = tagsByQuestionId.get(questionId) || []
          questionTagsList.forEach((tag) => {
            preferredTagScores.set(tag.id, (preferredTagScores.get(tag.id) || 0) + 1)
          })
        })

        const preferredTagIds = Array.from(preferredTagScores.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tagId]) => tagId)

        if (preferredTagIds.length > 0) {
          recommended = hydratedQuestions
            .filter((q) => !interactedQuestionIds.has(q.id))
            .filter((q) => q.tags.some((tag) => preferredTagIds.includes(tag.id)))
            .sort((a, b) => (b.votes + b.answerCount * 2) - (a.votes + a.answerCount * 2))
            .slice(0, 5)
        }
      }

      setQuestions(hydratedQuestions)
      setTags(tagsWithCount)
      setTrendingQuestions(trending)
      setRecommendedQuestions(recommended)
    } catch (err: any) {
      setError(err?.message || 'Failed to load explore data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExploreData()
  }, [user?.id])

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const filteredQuestions = useMemo(() => {
    let next = [...questions]

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase()
      next = next.filter((question) =>
        question.title.toLowerCase().includes(lower) ||
        question.body.toLowerCase().includes(lower)
      )
    }

    if (selectedTags.length > 0) {
      next = next.filter((question) =>
        question.tags.some((tag) => selectedTags.includes(tag.id))
      )
    }

    if (onlyUnanswered) {
      next = next.filter((question) => question.answerCount === 0)
    }

    if (onlyMostVoted) {
      next = next
        .filter((question) => question.votes > 0)
        .sort((a, b) => b.votes - a.votes)
    }

    return next
  }, [questions, searchTerm, selectedTags, onlyUnanswered, onlyMostVoted])

  const clearAllFilters = () => {
    setSelectedTags([])
    setOnlyUnanswered(false)
    setOnlyMostVoted(false)
    setSearchTerm('')
  }

  return (
    <div className="explore-page-wrapper">
      <div className="explore-page-header">
        <h1>Discover Questions</h1>
        <p className="explore-page-subtitle">
          Explore by tags, uncover trending discussions, and discover questions relevant to your activity.
        </p>
      </div>

      <div className="explore-page-layout">
        {/* Filters Sidebar */}
        <aside className="explore-page-sidebar">
          <div className="explore-page-filters">
            <h3 className="explore-page-filters-title">Advanced Filters</h3>

            {/* Tags */}
            <div className="explore-page-filter-section">
              <p className="explore-page-filter-label">Tags</p>
              <div className="explore-page-tag-list">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`explore-page-tag-filter ${selectedTags.includes(tag.id) ? 'active' : ''}`}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    <span>{tag.name}</span>
                    <span className="explore-page-tag-count">{tag.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="explore-page-divider" />

            {/* Filter Options */}
            <div className="explore-page-filter-section">
              <p className="explore-page-filter-label">Question Status</p>
              <div className="explore-page-sort-list">
                
                <label className="explore-page-sort-radio">
                  <input
                    type="checkbox"
                    checked={onlyMostVoted}
                    onChange={(e) => setOnlyMostVoted(e.target.checked)}
                  />
                  <span>Most voted only</span>
                </label>
              </div>
            </div>

            <button type="button" className="explore-page-clear-btn" onClick={clearAllFilters}>
              Clear all filters
            </button>
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

          {selectedTags.length > 0 && (
            <div className="explore-page-active-tags">
              {selectedTags.map((tagId) => (
                <button
                  type="button"
                  key={tagId}
                  className="explore-page-active-tag"
                  onClick={() => handleTagToggle(tagId)}
                >
                  {tagNameById.get(tagId) || 'Tag'}
                  <X size={14} />
                </button>
              ))}
            </div>
          )}

{isLoading ? (
            <div className="explore-page-loading">
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="explore-page-empty">
              <p className="explore-page-empty-title">Failed to load explore data</p>
              <p className="explore-page-empty-subtitle">{error}</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="explore-page-empty">
              <p className="explore-page-empty-title">No questions found</p>
              <p className="explore-page-empty-subtitle">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="explore-page-results">
              <div className="explore-page-section-header">
                <h2>Filtered Results</h2>
                <p>{filteredQuestions.length} question(s)</p>
              </div>
              <div className="explore-page-questions">
              {filteredQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
              </div>
            </div>
          )}

          <section className="explore-page-trending">
            <div className="explore-page-section-header">
              <h2>Trending Questions</h2>
              <p>High recent activity from views, answers, and votes</p>
            </div>
            {trendingQuestions.length === 0 ? (
              <p className="explore-page-section-empty">No trending questions yet.</p>
            ) : (
              <div className="explore-page-questions">
                {trendingQuestions.slice(0, 3).map((question) => (
                  <QuestionCard key={`trending-${question.id}`} question={question} />
                ))}
              </div>
            )}
          </section>

          {user && (
            <section className="explore-page-recommended">
              <div className="explore-page-section-header">
                <h2>Recommended For You</h2>
                <p>Based on tags you have interacted with</p>
              </div>
              {recommendedQuestions.length === 0 ? (
                <p className="explore-page-section-empty">Interact with more tags to get recommendations.</p>
              ) : (
                <div className="explore-page-questions">
                  {recommendedQuestions.slice(0, 3).map((question) => (
                    <QuestionCard key={`recommended-${question.id}`} question={question} />
                  ))}
                </div>
              )}
            </section>
          )}

          
        </main>
      </div>
    </div>
  )
}

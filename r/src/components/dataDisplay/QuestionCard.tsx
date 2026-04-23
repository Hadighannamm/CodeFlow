import { Link } from 'react-router-dom'
import { Eye, Bookmark, Repeat2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Question } from '../../types/Question'
import { useToast } from '../../customHooks/useToast'
import { useVoteService } from '../../customHooks/useVoteService'
import { useSavedQuestionService } from '../../customHooks/useSavedQuestionService'
import { useAuth } from '../../customHooks/useAuth'
import { voteService } from '../../services/voteService'
import { repostService } from '../../services/repostService'
import '../../styles/components/QuestionCard.css'

type QuestionCardProps = {
  question: Question
  onVoteChange?: (newVoteCount: number) => void
}

export default function QuestionCard({ question, onVoteChange }: QuestionCardProps) {
  const { user } = useAuth()
  const toast = useToast()
  const voteSvc = useVoteService()
  const savedSvc = useSavedQuestionService()

  const [voteCount, setVoteCount] = useState(question.votes)
  const [viewCount, setViewCount] = useState(question.viewCount)
  const [repostCount, setRepostCount] = useState(question.repostCount || 0)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [hasReposted, setHasReposted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isReposting, setIsReposting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setRepostCount(question.repostCount || 0)
  }, [question.repostCount])

  // Fetch user's existing vote, actual vote count, and view count when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch actual vote count from database
        const actualVoteCount = await voteService.getVoteCount(question.id)
        console.log('Actual vote count from DB:', actualVoteCount)
        setVoteCount(actualVoteCount)

        // Fetch user's vote if logged in
        if (user) {
          const existingVote = await voteSvc.getUserVote(user.id, question.id)
          if (existingVote) {
            setUserVote(existingVote.voteType === 1 ? 'up' : 'down')
          }

          // Check if question is saved
          const saved = await savedSvc.isQuestionSaved(user.id, question.id)
          setIsSaved(saved)

          const reposted = await repostService.hasUserReposted(user.id, question.id)
          setHasReposted(reposted)
        }
      } catch (err) {
        console.error('Error fetching vote data:', err)
      }
    }
    fetchData()
  }, [user, question.id, voteSvc, savedSvc])

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast.warning('You must be logged in to vote')
      return
    }

    // Prevent double submission
    if (isVoting) {
      return
    }

    setIsVoting(true)
    try {
      const voteTypeNum = voteType === 'up' ? 1 : -1
      console.log('Voting:', { userId: user.id, targetId: question.id, voteTypeNum, currentVoteCount: voteCount, currentUserVote: userVote })
      
      const existingVote = await voteSvc.getUserVote(user.id, question.id)
      console.log('Existing vote:', existingVote)

      let newCount = voteCount

      if (existingVote) {
        // User has already voted
        if ((existingVote.voteType === 1 && voteType === 'up') || 
            (existingVote.voteType === -1 && voteType === 'down')) {
          // Remove the vote (toggle off)
          console.log('Removing vote')
          const success = await voteSvc.deleteVote(existingVote.id)
          if (success) {
            newCount = voteCount - existingVote.voteType
            console.log('After removal:', { oldCount: voteCount, newCount, voteTypeRemoved: existingVote.voteType })
            setUserVote(null)
          }
        } else {
          // Change the vote from up to down or vice versa
          console.log('Changing vote')
          const oldVote = existingVote.voteType
          const updated = await voteSvc.updateVote(existingVote.id, voteTypeNum)
          if (updated) {
            newCount = voteCount - oldVote + voteTypeNum
            console.log('After change:', { oldCount: voteCount, newCount, oldVote, newVote: voteTypeNum })
            setUserVote(voteType)
          }
        }
      } else {
        // Create new vote
        console.log('Creating new vote')
        const newVote = await voteSvc.createVote({
          userId: user.id,
          targetId: question.id,
          targetType: 'question',
          voteType: voteTypeNum,
        })
        if (newVote) {
          newCount = voteCount + voteTypeNum
          console.log('After creation:', { oldCount: voteCount, newCount, newVote: voteTypeNum })
          setUserVote(voteType)
        }
      }

      // Verify the new count is a valid number
      if (isNaN(newCount)) {
        console.error('Invalid newCount:', newCount)
        throw new Error('Vote calculation resulted in invalid number')
      }

      setVoteCount(newCount)
      onVoteChange?.(newCount)
    } finally {
      setIsVoting(false)
    }
  }

  const handleSaveQuestion = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.warning('You must be logged in to save questions')
      return
    }

    setIsSaving(true)
    try {
      if (isSaved) {
        const success = await savedSvc.unsaveQuestion(user.id, question.id)
        if (success) {
          setIsSaved(false)
        }
      } else {
        const success = await savedSvc.saveQuestion(user.id, question.id)
        if (success) {
          setIsSaved(true)
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleRepost = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.warning('You must be logged in to repost')
      return
    }

    if (isReposting) return

    setIsReposting(true)
    try {
      const result = await repostService.toggleRepost(user.id, question.id)
      if (!result.success) {
        toast.error('Failed to update repost')
        return
      }

      if (result.isReposted) {
        setHasReposted(true)
        setRepostCount((prev) => prev + 1)
        toast.success('Question reposted')
      } else {
        setHasReposted(false)
        setRepostCount((prev) => Math.max(prev - 1, 0))
        toast.info('Repost removed')
      }
    } finally {
      setIsReposting(false)
    }
  }

  return (
    <Link to={`/question/${question.id}`} className="question-card">
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', position: 'relative' }}>
        {/* Bookmark Button */}
        <button
          onClick={handleSaveQuestion}
          disabled={isSaving}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            padding: '0.25rem',
            opacity: isSaving ? 0.6 : 1,
            zIndex: 10,
          }}
          title={isSaved ? 'Remove from saved' : 'Save question'}
        >
          <Bookmark
            size={20}
            style={{
              fill: isSaved ? '#f97316' : 'none',
              color: isSaved ? '#f97316' : '#9ca3af',
              transition: 'all 0.2s',
            }}
          />
        </button>

        {/* Stats */}
        <div className="question-card-stats" style={{ flexDirection: 'column' }}>
        </div>

        {/* Content */}
        <div>
          {/* Author Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {question.author.avatarUrl ? (
              <img 
                src={question.author.avatarUrl} 
                alt={question.author.username}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>
                {question.author.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              {question.author.username}
            </span>
          </div>

          <h3 className="question-card-title">
            {question.title}
          </h3>
          <p className="question-card-excerpt">
            {question.body.substring(0, 100)}...
          </p>

          {/* Tags and Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div className="question-card-tags">
              {question.tags.map((tag) => (
                <span key={tag.id} className="question-card-tag">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Row: Views and Votes left, Date right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Eye size={16} />
                <span>{viewCount} </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={(e) => e.preventDefault()}>
                <div className="question-card-vote-group">
                  <span className="question-card-vote-total">{voteCount}</span>
                  <button
                    type="button"
                    className={`question-card-vote-icon-btn up ${userVote === 'up' ? 'active' : ''}`}
                    onClick={() => handleVote('up')}
                    disabled={isVoting}
                    title="Like"
                  >
                    <ThumbsUp size={16} />
                  </button>
                  
                  <button
                    type="button"
                    className={`question-card-vote-icon-btn down ${userVote === 'down' ? 'active' : ''}`}
                    onClick={() => handleVote('down')}
                    disabled={isVoting}
                    title="Dislike"
                  >
                    <ThumbsDown size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  className={`question-card-repost-btn ${hasReposted ? 'active' : ''}`}
                  onClick={handleRepost}
                  disabled={isReposting}
                  title={hasReposted ? 'Remove repost' : 'Repost this question'}
                >
                  <Repeat2 size={16} />
                  <span>{repostCount}</span>
                </button>
              </div>
            </div>
            
            <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
              {new Date(question.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

import clsx from 'clsx'
import { useState } from 'react'
import type { Answer } from '../../types/Answer'
import VoteButton from './VoteButton'
import { useVoteService } from '../../customHooks/useVoteService'
import { useToast } from '../../customHooks/useToast'
import { useAuth } from '../../customHooks/useAuth'

type AnswerItemProps = {
  answer: Answer
  isAccepted?: boolean
  onVoteChange?: (answerId: string, newVoteCount: number) => void
}

export default function AnswerItem({
  answer,
  isAccepted = false,
  onVoteChange,
}: AnswerItemProps) {
  const { user } = useAuth()
  const toast = useToast()
  const voteService = useVoteService()
  const [voteCount, setVoteCount] = useState(answer.votes)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast.warning('You must be logged in to vote')
      return
    }

    setIsVoting(true)
    try {
      const voteTypeNum = voteType === 'up' ? 1 : -1
      const existingVote = await voteService.getUserVote(user.id, answer.id)

      let newCount = voteCount

      if (existingVote) {
        // User has already voted
        if ((existingVote.voteType === 1 && voteType === 'up') || 
            (existingVote.voteType === -1 && voteType === 'down')) {
          // Remove the vote (toggle off)
          const success = await voteService.deleteVote(existingVote.id)
          if (success) {
            newCount = voteCount - existingVote.voteType
            setUserVote(null)
          }
        } else {
          // Change the vote
          const oldVote = existingVote.voteType
          const updated = await voteService.updateVote(existingVote.id, voteTypeNum)
          if (updated) {
            newCount = voteCount - oldVote + voteTypeNum
            setUserVote(voteType)
          }
        }
      } else {
        // Create new vote
        const newVote = await voteService.createVote({
          userId: user.id,
          targetId: answer.id,
          targetType: 'answer',
          voteType: voteTypeNum,
        })
        if (newVote) {
          newCount = voteCount + voteTypeNum
          setUserVote(voteType)
        }
      }

      setVoteCount(newCount)
      onVoteChange?.(answer.id, newCount)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div
      style={{
        backgroundColor: isAccepted ? '#fef3c7' : '#ffffff',
        border: isAccepted ? '2px solid #f97316' : '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem' }}>
        {/* Vote Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <VoteButton
            voteType="up"
            count={voteCount}
            onVote={() => handleVote('up')}
            userVote={userVote}
            isLoading={isVoting}
          />
          <VoteButton
            voteType="down"
            count={0}
            onVote={() => handleVote('down')}
            userVote={userVote}
            isLoading={isVoting}
          />
          {isAccepted && (
            <div style={{ color: '#f97316', fontSize: '0.75rem', fontWeight: '600', marginTop: '0.5rem' }}>
              ✓ Accepted
            </div>
          )}
        </div>

        {/* Answer Content */}
        <div>
          {/* Author Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            {answer.author.avatarUrl ? (
              <img
                src={answer.author.avatarUrl}
                alt={answer.author.username}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#6b7280',
                }}
              >
                {answer.author.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                {answer.author.username}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {new Date(answer.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <p style={{ color: '#1f2937', marginBottom: '1rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {answer.body}
          </p>
        </div>
      </div>
    </div>
  )
}

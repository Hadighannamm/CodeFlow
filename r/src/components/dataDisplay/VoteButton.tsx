import { ThumbsUp, ThumbsDown } from 'lucide-react'
import clsx from 'clsx'

type VoteButtonProps = {
  voteType: 'up' | 'down'
  count: number
  onVote: (voteType: 'up' | 'down') => void
  userVote?: 'up' | 'down' | null
  isLoading?: boolean
}

export default function VoteButton({
  voteType,
  count,
  onVote,
  userVote,
  isLoading = false,
}: VoteButtonProps) {
  const isActive = userVote === voteType

  return (
    <button
      onClick={() => onVote(voteType)}
      disabled={isLoading}
      className={clsx(
        'question-card-vote-btn',
        voteType === 'up' ? 'vote-up' : 'vote-down',
        isActive && 'active'
      )}
    >
      <span className="question-card-vote-count">{count}</span>
      {voteType === 'up' ? (
        <ThumbsUp size={18} />
      ) : (
        <ThumbsDown size={18} />
      )}
    </button>
  )
}

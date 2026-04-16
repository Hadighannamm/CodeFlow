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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        color: isActive
          ? voteType === 'up'
            ? '#16a34a'
            : '#dc2626'
          : '#4b5563',
        opacity: isLoading ? 0.5 : 1,
        transition: 'color 0.2s',
        outline: 'none',
      }}
    >
      {voteType === 'up' && (
        <span className="text-sm font-semibold">{count}</span>
      )}
      {voteType === 'up' ? (
        <ThumbsUp size={18} />
      ) : (
        <ThumbsDown size={18} />
      )}
      
    </button>
  )
}

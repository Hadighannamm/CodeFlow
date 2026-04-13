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
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        isActive
          ? voteType === 'up'
            ? 'bg-green-100 text-green-600'
            : 'bg-red-100 text-red-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      {voteType === 'up' ? (
        <ThumbsUp size={18} />
      ) : (
        <ThumbsDown size={18} />
      )}
      <span className="text-sm font-semibold">{count}</span>
    </button>
  )
}

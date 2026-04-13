import clsx from 'clsx'
import type { Answer } from '../../types/Answer'
import VoteButton from './VoteButton'

type AnswerItemProps = {
  answer: Answer
  isAccepted?: boolean
  onVote?: (voteType: 'up' | 'down') => void
}

export default function AnswerItem({
  answer,
  isAccepted = false,
  onVote,
}: AnswerItemProps) {
  return (
    <div className={clsx('border-l-4 pl-4 py-4', isAccepted ? 'border-[#f97316] bg-[#fed7aa]' : 'border-gray-300')}>
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-2">
          {onVote && (
            <>
              <VoteButton
                voteType="up"
                count={answer.votes}
                onVote={onVote}
              />
            </>
          )}
          {isAccepted && (
            <div className="text-[#f97316] text-xs font-semibold">
              ✓ Accepted
            </div>
          )}
        </div>

        {/* Answer Content */}
        <div className="flex-1">
          <p className="text-gray-800 mb-4 whitespace-pre-wrap">
            {answer.body}
          </p>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>answered by</span>
            <span className="font-semibold text-gray-700">
              {answer.author.username}
            </span>
            <span>•</span>
            <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

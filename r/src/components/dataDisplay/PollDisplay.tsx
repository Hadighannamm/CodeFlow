import { useState } from 'react'
import type { Poll } from '../../types/Poll'
import { useToast } from '../../customHooks/useToast'
import { useAuth } from '../../customHooks/useAuth'
import { pollService } from '../../services/pollService'
import '../../styles/components/PollDisplay.css'

interface PollDisplayProps {
  poll: Poll
  onVoteSuccess?: () => void
}

export default function PollDisplay({ poll: initialPoll, onVoteSuccess }: PollDisplayProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [poll, setPoll] = useState(initialPoll)
  const [hasVoted, setHasVoted] = useState(false)
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [totalVotes, setTotalVotes] = useState(
    poll.options.reduce((sum, option) => sum + (option.votes || 0), 0)
  )

  const handleVote = async (optionId: string) => {
    if (!user || isVoting) return

    // If they click the same option, allow them to vote again (will show error from server if already voted)
    // If they click a different option, let them change their vote

    setIsVoting(true)
    try {
      await pollService.votePoll(poll.id, optionId, user.id)
      setHasVoted(true)
      setVotedOptionId(optionId)
      
      // Immediately update the UI with the new vote count
      // This ensures percentages update instantly without waiting for API refresh
      const updatedOptions = poll.options.map((option) =>
        option.id === optionId ? { ...option, votes: (option.votes || 0) + 1 } : option
      )
      const updatedPoll = { ...poll, options: updatedOptions }
      setPoll(updatedPoll)
      const newTotal = totalVotes + 1
      setTotalVotes(newTotal)
      
      console.log('Vote recorded - updated total votes:', newTotal, 'for option:', optionId)
      
      toast.success('Vote recorded!')
      onVoteSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to vote on poll. You may have already voted.'
      toast.error(message)
    } finally {
      setIsVoting(false)
    }
  }

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0
    return Math.round((votes / totalVotes) * 100)
  }

  return (
    <div className="poll-display-container">
      <div className="poll-display-options">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes || 0)
          const isVotedOption = votedOptionId === option.id
          
          return (
            <button
              key={option.id}
              className={`poll-option ${isVotedOption ? 'voted' : ''}`}
              onClick={() => handleVote(option.id)}
              disabled={!user || isVoting}
            >
              <div className="poll-option-left">
                <div className={`poll-option-radio ${isVotedOption ? 'checked' : ''}`}>
                  {isVotedOption && <span className="poll-option-radio-check">✓</span>}
                </div>
                <span className="poll-option-text">{option.text}</span>
              </div>
              
              <div className="poll-option-bar">
                <div className="poll-option-bar-background">
                  <div
                    className={`poll-option-bar-fill ${isVotedOption ? 'voted' : ''}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="poll-option-percentage">{percentage}%</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="poll-display-footer">
        <span className="poll-display-total-votes">
          Total votes: {totalVotes}
        </span>
        {user && hasVoted && (
          <span className="poll-display-voted-status">Your vote</span>
        )}
        {!user && (
          <span className="poll-display-login-message">Sign in to vote</span>
        )}
      </div>
    </div>
  )
}

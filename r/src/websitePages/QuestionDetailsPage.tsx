import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Question } from '../types/Question'
import type { Answer } from '../types/Answer'
import AnswerForm from '../components/forms/AnswerForm'
import AnswerItem from '../components/dataDisplay/AnswerItem'
import VoteButton from '../components/dataDisplay/VoteButton'

export default function QuestionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [question, _setQuestion] = useState<Question | null>(null)
  const [answers, _setAnswers] = useState<Answer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch question and answers from API
    setIsLoading(false)
  }, [id])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading question...</div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Question not found</div>
      </div>
    )
  }

  const handleAnswerSubmit = async (body: string) => {
    // TODO: Create answer via API
    console.log('Submitting answer:', body)
  }

  const handleVote = async (voteType: 'up' | 'down') => {
    // TODO: Vote on question
    console.log('Voting:', voteType)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Question */}
      <div className="mb-8">
        <div className="flex gap-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-2">
            <VoteButton
              voteType="up"
              count={question.votes}
              onVote={handleVote}
            />
            <div className="text-sm text-gray-600">{question.answerCount} answers</div>
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {question.title}
            </h1>

            <p className="text-gray-700 mb-6 whitespace-pre-wrap">
              {question.body}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <span key={tag.id} className="badge-primary">
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Meta */}
            <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
              asked {new Date(question.createdAt).toLocaleDateString()} by{' '}
              <span className="font-semibold text-gray-700">
                {question.author.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-8" />

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No answers yet. Be the first to answer this question!
          </div>
        ) : (
          <div className="space-y-6">
            {answers.map((answer) => (
              <AnswerItem
                key={answer.id}
                answer={answer}
                isAccepted={answer.isAccepted}
              />
            ))}
          </div>
        )}
      </div>

      <hr className="my-8" />

      {/* Answer Form */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Answer</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <AnswerForm onSubmit={handleAnswerSubmit} />
        </div>
      </div>
    </div>
  )
}

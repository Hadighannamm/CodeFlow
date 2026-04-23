import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { Question } from '../types/Question'
import type { Answer } from '../types/Answer'
import AnswerForm from '../components/forms/AnswerForm'
import AnswerItem from '../components/dataDisplay/AnswerItem'
import VoteButton from '../components/dataDisplay/VoteButton'
import PollDisplay from '../components/dataDisplay/PollDisplay'
import { useToast } from '../customHooks/useToast'
import { useQuestionService } from '../customHooks/useQuestionService'
import { useAnswerService } from '../customHooks/useAnswerService'
import { useVoteService } from '../customHooks/useVoteService'
import { useAuth } from '../customHooks/useAuth'
import { voteService } from '../services/voteService'
import { supabase } from '../lib/supabaseClient'

export default function QuestionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const questionSvc = useQuestionService()
  const answerSvc = useAnswerService()
  const voteSvc = useVoteService()

  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
  const viewsIncrementedRef = useRef(false)

  // Reset views increment flag when question ID changes
  useEffect(() => {
    viewsIncrementedRef.current = false
  }, [id])

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) {
        toast.error('Question ID not found')
        setIsLoading(false)
        return
      }

      try {
        const fetchedQuestion = await questionSvc.getQuestionById(id)
        if (!fetchedQuestion) {
          toast.error('Question not found')
        } else {
          setQuestion(fetchedQuestion)

          // Fetch actual vote count from database
          const actualVoteCount = await voteService.getVoteCount(id)
          setVoteCount(actualVoteCount)
          console.log('Actual vote count from DB:', actualVoteCount)

          // Increment view count only once per page visit
          if (id && !viewsIncrementedRef.current) {
            viewsIncrementedRef.current = true
            try {
              const { data: question, error: fetchError } = await supabase
                .from('questions')
                .select('view_count')
                .eq('id', id)
                .single()

              if (!fetchError && question) {
                const newViewCount = (question.view_count || 0) + 1
                await supabase
                  .from('questions')
                  .update({ view_count: newViewCount })
                  .eq('id', id)
              }
            } catch (err) {
              console.error('Error incrementing view count:', err)
            }
          }

          // Fetch user's vote if logged in
          if (user) {
            const userVoteData = await voteSvc.getUserVote(user.id, id)
            if (userVoteData) {
              setUserVote(userVoteData.voteType === 1 ? 'up' : 'down')
            }
          }

          // Fetch answers
          const fetchedAnswers = await answerSvc.getAnswersByQuestion(id)
          setAnswers(fetchedAnswers)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestion()
  }, [id, user, questionSvc, answerSvc, voteSvc, toast])

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast.warning('You must be logged in to vote')
      return
    }

    if (!id) return

    setIsVoting(true)
    try {
      const voteTypeNum = voteType === 'up' ? 1 : -1
      const existingVote = await voteSvc.getUserVote(user.id, id)

      if (existingVote) {
        // User has already voted
        if ((existingVote.voteType === 1 && voteType === 'up') || 
            (existingVote.voteType === -1 && voteType === 'down')) {
          // Remove the vote (toggle off)
          const success = await voteSvc.deleteVote(existingVote.id)
          if (success) {
            setVoteCount(voteCount - existingVote.voteType)
            setUserVote(null)
          }
        } else {
          // Change the vote
          const oldVote = existingVote.voteType
          const updated = await voteSvc.updateVote(existingVote.id, voteTypeNum)
          if (updated) {
            setVoteCount(voteCount - oldVote + voteTypeNum)
            setUserVote(voteType)
          }
        }
      } else {
        // Create new vote
        const newVote = await voteSvc.createVote({
          userId: user.id,
          targetId: id,
          targetType: 'question',
          voteType: voteTypeNum,
        })
        if (newVote) {
          setVoteCount(voteCount + voteTypeNum)
          setUserVote(voteType)
        }
      }

      // Update the question's vote count in state
      if (question) {
        setQuestion({
          ...question,
          votes: voteCount + (voteTypeNum - (userVote === 'up' ? 1 : userVote === 'down' ? -1 : 0)),
        })
      }
    } finally {
      setIsVoting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading question...</div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error || 'Question not found'}</div>
      </div>
    )
  }

  const handleAnswerSubmit = async (body: string) => {
    if (!user || !id) {
      toast.warning('You must be logged in to answer')
      return
    }

    setIsSubmittingAnswer(true)

    try {
      const newAnswer = await answerSvc.createAnswer({
        body,
        questionId: id,
        userId: user.id,
      })

      if (newAnswer) {
        // Add the new answer to the list
        setAnswers((prev) => [...prev, newAnswer])

        // Update the question's answer count
        if (question) {
          setQuestion({
            ...question,
            answerCount: question.answerCount + 1,
          })
        }
      }
    } finally {
      setIsSubmittingAnswer(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          
          gap: '5px',
          backgroundColor: '#f97316',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          marginBottom: '30px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ea580c')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
      >
        <ChevronLeft size={25} style={{ flexShrink: 0, marginLeft: '-8px' }} />
        Back
      </button>

      {/* Question */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div className="flex gap-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-2">
            <VoteButton
              voteType="up"
              count={voteCount}
              onVote={() => handleVote('up')}
              userVote={userVote}
              isLoading={isVoting}
            />
            <div style={{ marginLeft:'12px'}}>
            <VoteButton
              voteType="down"
              count={0}
              onVote={() => handleVote('down')}
              userVote={userVote}
              isLoading={isVoting}
            />
            </div>
            
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

            {/* Poll */}
            {question.poll && (
              <PollDisplay poll={question.poll} />
            )}

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
        <div className="bg-[#f5f5f0] border border-gray-200 rounded-lg p-6">
          <AnswerForm onSubmit={handleAnswerSubmit} isLoading={isSubmittingAnswer} />
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}


import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import type { Question } from '../../types/Question'
import '../../styles/components/QuestionCard.css'

type QuestionCardProps = {
  question: Question
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Link to={`/question/${question.id}`} className="question-card">
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem' }}>
        {/* Stats */}
        <div className="question-card-stats" style={{ flexDirection: 'column' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-orange)' }}>{question.votes}</div>
          <div className="text-gray-600">votes</div>

          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-green-600)' }}>{question.answerCount}</div>
          <div className="text-gray-600">answers</div>

          <div style={{ fontSize: '1rem', color: 'var(--color-gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <Eye size={16} />
            {question.viewCount}
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="question-card-title">
            {question.title}
          </h3>
          <p className="question-card-excerpt">
            {question.body.substring(0, 100)}...
          </p>

          {/* Tags and Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="question-card-tags">
              {question.tags.map((tag) => (
                <span key={tag.id} className="question-card-tag">
                  {tag.name}
                </span>
              ))}
            </div>
            <div className="question-card-footer">
              by <span className="question-card-author">{question.author.username}</span>
              <span style={{ margin: '0 0.25rem' }}>•</span>
              {new Date(question.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

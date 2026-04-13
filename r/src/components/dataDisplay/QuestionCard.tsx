import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import type { Question } from '../../types/Question'

type QuestionCardProps = {
  question: Question
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Link to={`/question/${question.id}`}>
      <div className="card hover:shadow-lg cursor-pointer">
        <div className="grid grid-cols-12 gap-4">
          {/* Stats */}
          <div className="col-span-2 flex flex-col gap-2 text-center text-sm">
            <div className="text-2xl font-bold text-blue-600">{question.votes}</div>
            <div className="text-gray-600">votes</div>

            <div className="text-xl font-bold text-green-600">{question.answerCount}</div>
            <div className="text-gray-600">answers</div>

            <div className="text-lg text-gray-600 flex items-center justify-center gap-1">
              <Eye size={16} />
              {question.viewCount}
            </div>
          </div>

          {/* Content */}
          <div className="col-span-10">
            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2">
              {question.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {question.body}
            </p>

            {/* Tags and Meta */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {question.tags.map((tag) => (
                  <span key={tag.id} className="badge text-xs">
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                by <span className="font-semibold">{question.author.username}</span>
                <span className="mx-1">•</span>
                {new Date(question.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

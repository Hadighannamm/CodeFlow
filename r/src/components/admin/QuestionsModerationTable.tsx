import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, Eye, Pencil, Trash2 } from 'lucide-react'
import type { AdminAnswerModerationItem, AdminQuestionModerationItem } from '../../services/adminService'

type QuestionsModerationTableProps = {
  questions: AdminQuestionModerationItem[]
  answersByQuestionId: Record<string, AdminAnswerModerationItem[]>
  expandedQuestionIds: Set<string>
  answersLoadingQuestionIds: Set<string>
  onToggleAnswers: (questionId: string) => void
  onDeleteQuestion: (questionId: string) => void
  onDeleteAnswer: (answerId: string) => void
}

function formatDate(dateText: string) {
  return new Date(dateText).toLocaleDateString()
}

export default function QuestionsModerationTable({
  questions,
  answersByQuestionId,
  expandedQuestionIds,
  answersLoadingQuestionIds,
  onToggleAnswers,
  onDeleteQuestion,
  onDeleteAnswer,
}: QuestionsModerationTableProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table admin-content-table">
        <thead>
          <tr>
            <th className="expand-col" />
            <th>Title</th>
            <th>Author</th>
            <th>Created Date</th>
            <th>Votes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan={6} className="no-data">
                No questions matched the selected filters.
              </td>
            </tr>
          ) : (
            questions.map((question) => {
              const isExpanded = expandedQuestionIds.has(question.id)
              const answers = answersByQuestionId[question.id] || []
              const isAnswersLoading = answersLoadingQuestionIds.has(question.id)

              return (
                <Fragment key={question.id}>
                  <tr className={question.isReported ? 'reported-row' : ''}>
                    <td>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => onToggleAnswers(question.id)}
                        aria-label={isExpanded ? 'Collapse answers' : 'Expand answers'}
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                    <td>
                      <div className="question-title-cell">{question.title}</div>
                      {question.tags.length > 0 && (
                        <div className="tag-chip-row">
                          {question.tags.slice(0, 4).map((tag) => (
                            <span key={`${question.id}-${tag}`} className="tag-chip">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>{question.authorName}</td>
                    <td>{formatDate(question.createdAt)}</td>
                    <td>{question.votes}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/question/${question.id}`} className="btn-secondary btn-inline-icon">
                          <Eye size={14} />
                          View
                        </Link>
                        <Link to={`/question/${question.id}/edit`} className="btn-warning btn-inline-icon">
                          <Pencil size={14} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDeleteQuestion(question.id)}
                          className="btn-danger btn-inline-icon"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="expanded-row-cell">
                        <div className="expanded-panel">
                          <h4>Answers ({question.answerCount})</h4>
                          {isAnswersLoading ? (
                            <p className="subtle-text">Loading answers...</p>
                          ) : answers.length === 0 ? (
                            <p className="subtle-text">No answers for this question yet.</p>
                          ) : (
                            <div className="answer-list">
                              {answers.map((answer) => (
                                <div key={answer.id} className="answer-item">
                                  <div>
                                    <p className="answer-meta">
                                      {answer.authorName} · {formatDate(answer.createdAt)}
                                      {answer.isReported && (
                                        <span className="status-badge pending answer-report-badge">
                                          Reported ({answer.reportCount})
                                        </span>
                                      )}
                                    </p>
                                    <p className="answer-body-preview">{answer.body}</p>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn-danger btn-inline-icon"
                                    onClick={() => onDeleteAnswer(answer.id)}
                                  >
                                    <Trash2 size={14} />
                                    Delete Answer
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

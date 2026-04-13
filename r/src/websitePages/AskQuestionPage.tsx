import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestionForm from '../components/forms/QuestionForm'
import type { CreateQuestionInput } from '../types/Question'
import { questionService } from '../services/questionService'
import '../styles/pages/AskQuestionPage.css'

export default function AskQuestionPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateQuestionInput) => {
    setIsLoading(true)
    try {
      const newQuestion = await questionService.createQuestion(data)
      navigate(`/question/${newQuestion.id}`)
    } catch (error) {
      console.error('Failed to create question:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ask-question-page-container">
      <div className="ask-question-page-intro">
        <h1>Ask a Question</h1>
        <p>
          Help the community by sharing your question. Be clear and specific for better answers.
        </p>
      </div>

      <div className="ask-question-page-form-container">
        <QuestionForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Tips Section */}
      <div className="ask-question-page-tips-grid">
        <div className="ask-question-tips-box good">
          <h3>Tips for great questions</h3>
          <ul>
            <li>• Be specific and clear</li>
            <li>• Include relevant code or error messages</li>
            <li>• Use meaningful tags</li>
            <li>• Proofread before posting</li>
          </ul>
        </div>
        <div className="ask-question-tips-box bad">
          <h3>What to avoid</h3>
          <ul>
            <li>• Don't ask for homework help</li>
            <li>• Avoid posting duplicate questions</li>
            <li>• Don't include external links unnecessarily</li>
            <li>• Avoid vague or unclear descriptions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

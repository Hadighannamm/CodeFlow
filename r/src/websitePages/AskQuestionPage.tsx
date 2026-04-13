import { useNavigate } from 'react-router-dom'
import QuestionForm from '../components/forms/QuestionForm'
import type { CreateQuestionInput } from '../types/Question'

export default function AskQuestionPage() {
  const _navigate = useNavigate()
  const isLoading = false

  const handleSubmit = async (data: CreateQuestionInput) => {
    // TODO: Call API to create question
    console.log('Creating question:', data)
    // navigate(`/question/${newQuestionId}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-gray-600">
          Help the community by sharing your question. Be clear and specific for better answers.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <QuestionForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Tips Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for great questions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific and clear</li>
            <li>• Include relevant code or error messages</li>
            <li>• Use meaningful tags</li>
            <li>• Proofread before posting</li>
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">What to avoid</h3>
          <ul className="text-sm text-amber-800 space-y-1">
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

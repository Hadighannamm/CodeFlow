import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <FileQuestion size={64} className="mx-auto mb-4 text-gray-400" />
        <h1 className="text-5xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl text-gray-700 mb-2">Page Not Found</p>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/explore" className="btn-secondary">
            Explore Questions
          </Link>
        </div>
      </div>
    </div>
  )
}

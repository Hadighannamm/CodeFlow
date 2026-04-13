import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export default function ErrorPage() {
  const error = useRouteError()

  let status = 500
  let message = 'Something went wrong'

  if (isRouteErrorResponse(error)) {
    status = error.status
    message = error.statusText || error.data?.message || 'An error occurred'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center px-4">
      <div className="text-center text-white max-w-md">
        <AlertCircle size={64} className="mx-auto mb-4 opacity-80" />
        <h1 className="text-5xl font-bold mb-2">{status}</h1>
        <p className="text-xl mb-8">{message}</p>
        <p className="text-red-100 mb-8">
          Something unexpected happened. Please try again or return to the home page.
        </p>
        <Link to="/" className="btn-primary inline-block">
          Go Home
        </Link>
      </div>
    </div>
  )
}

import { useToast } from '../customHooks/useToast'

/**
 * Error handler utility that displays toast notifications for errors
 * Usage:
 * ```
 * try {
 *   // your code
 * } catch (error) {
 *   handleError(error, toast, 'Failed to update profile')
 * }
 * ```
 */
export function handleError(
  error: unknown,
  showToast: (message: string, duration?: number) => void,
  fallbackMessage: string = 'An error occurred',
  duration?: number
): string {
  let message = fallbackMessage

  if (error instanceof Error) {
    message = error.message || fallbackMessage
  } else if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    // Handle Supabase or other API errors
    const apiError = error as any
    message = apiError.message || apiError.error_description || fallbackMessage
  }

  showToast(message, duration)
  return message
}

/**
 * Hook to use the error handler with toast
 * Usage:
 * ```
 * const { errorHandler } = useErrorHandler()
 * try {
 *   // code
 * } catch (error) {
 *   errorHandler(error, 'Custom error message')
 * }
 * ```
 */
export function useErrorHandler() {
  const toast = useToast()

  return {
    errorHandler: (error: unknown, fallbackMessage: string = 'An error occurred', duration?: number) => {
      return handleError(error, toast.error, fallbackMessage, duration)
    },
  }
}

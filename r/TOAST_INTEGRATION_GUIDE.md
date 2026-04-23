# Toast Notification System - Integration Guide

## Overview
The toast notification system provides dynamic, themed notifications for errors and other messages throughout the app.

## Features
- ✅ **Automatic error display** - Display errors as toasts
- ✅ **Multiple types** - error, success, warning, info
- ✅ **Auto-dismiss** - Toasts auto-close after 5 seconds (configurable)
- ✅ **Themed styling** - Matches your project's orange and off-white theme
- ✅ **Accessibility** - ARIA labels and live regions
- ✅ **Smooth animations** - Slide in/out transitions
- ✅ **Responsive** - Works on mobile and desktop

## Basic Usage

### 1. Using the `useToast` Hook

```tsx
import { useToast } from '@/customHooks/useToast'

export default function MyComponent() {
  const toast = useToast()

  const handleAction = async () => {
    try {
      // your code
      toast.success('Operation completed!')
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return <button onClick={handleAction}>Click me</button>
}
```

### 2. Using Different Toast Types

```tsx
const toast = useToast()

// Success
toast.success('Profile updated successfully')

// Error
toast.error('Failed to save changes')

// Warning
toast.warning('This action cannot be undone')

// Info
toast.info('Please confirm your email')

// Custom duration (milliseconds)
toast.success('Message', 3000) // Disappears after 3 seconds
toast.error('Important error', 0) // Never auto-dismisses
```

### 3. With Error Handler Utility

For consistent error handling across your app:

```tsx
import { useErrorHandler } from '@/lib/errorHandler'

export default function UserForm() {
  const { errorHandler } = useErrorHandler()

  const handleSubmit = async (data) => {
    try {
      await updateUser(data)
      // You can still manually show success messages
    } catch (error) {
      // Automatically shows error toast
      errorHandler(error, 'Failed to update profile')
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## Integration in Services

Update your API service files to use toasts for errors:

### Before (current approach)
```tsx
// answerService.ts
const { data: answers, error } = await supabase
  .from('answers')
  .select('*')

if (error) {
  console.error('Error fetching answers:', error)
  // Users don't see the error
}
```

### After (with toast)
```tsx
// answerService.ts
import { useToast } from '../customHooks/useToast'

export function useAnswerService() {
  const toast = useToast()

  const getAnswers = async (questionId: string) => {
    const { data: answers, error } = await supabase
      .from('answers')
      .select('*')
      .eq('question_id', questionId)

    if (error) {
      toast.error(`Failed to load answers: ${error.message}`)
      return null
    }
    return answers
  }

  return { getAnswers }
}
```

## Integration in Components

### Form Submission Example

```tsx
import { useToast } from '@/customHooks/useToast'
import { useErrorHandler } from '@/lib/errorHandler'

export default function AskQuestionForm() {
  const toast = useToast()
  const { errorHandler } = useErrorHandler()

  const handleSubmit = async (formData) => {
    try {
      const response = await submitQuestion(formData)
      toast.success('Question posted successfully!')
      // Redirect or clear form
    } catch (error) {
      errorHandler(error, 'Failed to post question')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

### Async Operations with Loading

```tsx
export default function VoteButton() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async () => {
    setIsLoading(true)
    try {
      await submitVote()
      toast.success('Vote recorded!')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to record vote')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button onClick={handleVote} disabled={isLoading}>
      {isLoading ? 'Voting...' : 'Vote'}
    </button>
  )
}
```

## Styling Customization

The toast component uses CSS classes that match your theme:

- **Error**: Red background (#fee2e2) with red border
- **Success**: Green background (#f0fdf4) with green border
- **Warning**: Amber background (#fffbeb) with amber border
- **Info**: Blue background (#eff6ff) with blue border

Edit [src/styles/components/Toast.css](src/styles/components/Toast.css) to customize appearance.

## Toast Container Position

By default, toasts appear in the **top-right corner**. To change this, edit `.toast-container` in the CSS file:

```css
.toast-container {
  top: 20px;      /* Change to: bottom: 20px; */
  right: 20px;    /* Or: left: 20px; */
}
```

## Files Created

- `src/context/ToastContext.tsx` - Context and Provider
- `src/customHooks/useToast.ts` - Hook for easy integration
- `src/components/layout/ToastContainer.tsx` - Container component
- `src/components/layout/ToastItem.tsx` - Individual toast component
- `src/styles/components/Toast.css` - Styling
- `src/lib/errorHandler.ts` - Error handling utility

## Next Steps

1. ✅ Add `useToast` to your service files and components
2. ✅ Replace `console.error()` calls with `toast.error()`
3. ✅ Add success messages after important operations
4. ✅ Test error scenarios to see toasts in action

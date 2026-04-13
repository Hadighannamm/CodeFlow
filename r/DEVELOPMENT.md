# CodeFlow Development Guide

This guide helps you understand how to continue developing CodeFlow by implementing the backend services and completing placeholder features.

## Project Status

The CodeFlow MVP has been scaffolded with:
- ✅ Complete UI structure with Tailwind CSS styling
- ✅ React Router setup with all pages
- ✅ Type definitions for all entities
- ✅ Service module structure
- ✅ Custom hooks for authentication
- ✅ Component library ready to use
- ⏳ API integration (in progress)

## TODO: Implement API Services

All service modules in `src/services/` have `TODO` comments indicating what needs to be implemented. The pattern is consistent:

### Example: Implementing questionService

Replace the placeholder with actual Supabase queries:

```typescript
// BEFORE (placeholder)
async getQuestionById(id: string): Promise<Question | null> {
  // TODO: Implement with Supabase query
  console.log('Fetching question', id)
  return null
}

// AFTER (actual implementation)
async getQuestionById(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*, author:users(*), tags(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}
```

### Priority Services to Implement

1. **authService** - Critical for authentication flow
   - `signUp()` - Register new user
   - `signIn()` - Login
   - `signOut()` - Logout
   - `getCurrentUser()` - Get session user

2. **questionService** - Core feature
   - `getAllQuestions()` - Fetch question list
   - `getQuestionById()` - Get single question
   - `createQuestion()` - Create new question
   - `searchQuestions()` - Search functionality

3. **answerService** - Core feature
   - `getAnswersByQuestion()` - Fetch answers for question
   - `createAnswer()` - Post new answer

4. **voteService** - Interaction feature
   - `createVote()` - Upvote/downvote
   - `getUserVote()` - Check user's existing vote

## Supabase Setup Checklist

Before implementing services, ensure your Supabase project has:

### Tables

- [ ] `users` - User profiles
  - `id` (UUID)
  - `username` (text)
  - `email` (text)
  - `reputation` (integer, default 0)
  - `bio` (text, nullable)
  - `avatar` (text, nullable URL)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- [ ] `questions` - Questions
  - `id` (UUID)
  - `title` (text)
  - `body` (text)
  - `author_id` (UUID, FK to users)
  - `votes` (integer, default 0)
  - `answer_count` (integer, default 0)
  - `view_count` (integer, default 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- [ ] `answers` - Answers/Responses
  - `id` (UUID)
  - `body` (text)
  - `question_id` (UUID, FK to questions)
  - `author_id` (UUID, FK to users)
  - `votes` (integer, default 0)
  - `is_accepted` (boolean, default false)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- [ ] `tags` - Question tags
  - `id` (UUID)
  - `name` (text, unique)
  - `description` (text, nullable)
  - `count` (integer, default 0) - Question count with tag

- [ ] `question_tags` - Many-to-many relationship
  - `question_id` (UUID, FK to questions)
  - `tag_id` (UUID, FK to tags)
  - Primary key: (question_id, tag_id)

- [ ] `votes` - Vote history
  - `id` (UUID)
  - `user_id` (UUID, FK to users)
  - `target_id` (UUID) - questionId or answerId
  - `target_type` (enum: 'question', 'answer')
  - `vote_type` (integer: 1 for up, -1 for down)
  - `created_at` (timestamp)

### Authentication

- [ ] Enable Email/Password authentication in Supabase Auth
- [ ] Set custom user metadata if needed
- [ ] Configure JWT expiration and refresh policies

### RLS (Row-Level Security)

- [ ] Enable RLS on all tables
- [ ] Create policies for public read on questions/answers
- [ ] Create policies for authenticated write/delete
- [ ] Create policies for user profile privacy

## Component Implementation Checklist

### Pages to Complete

- [ ] **HomePage** - Implement question fetching
  - Use `questionService.getAllQuestions()`
  - Implement sorting logic
  -Add pagination for large lists

- [ ] **AskQuestionPage** - Hook up form
  - Call `questionService.createQuestion()`
  - Redirect to new question page after creation
  - Add error handling

- [ ] **QuestionDetailsPage** - Fetch and display
  - Fetch question and answers
  - Implement voting functionality
  - Add answer submission

- [ ] **AuthPage** - Complete authentication
  - Wire `authService.signUp()` and `signIn()`
  - Handle auth errors
  - Redirect on successful auth

### Components to Complete

- [ ] **loading-error/** - Create error and loading states
  - `ErrorAlert.tsx` - Display error messages
  - `LoadingSpinner.tsx` - Loading placeholder

- [ ] **search-filter/** - Search functionality
  - `SearchBar.tsx` - Search queries
  - `FilterPanel.tsx` - Filter options

## State Management Pattern

All components follow this pattern for API calls:

```typescript
const [data, setData] = useState<Type | null>(null)
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const result = await serviceModule.getFunction()
      setData(result)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }
  
  fetchData()
}, [dependencies])
```

## Form Handling Pattern

QuestionForm and AnswerForm use this pattern:

```typescript
interface FormProps {
  onSubmit: (data: FormData) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<FormData>
}

export default function MyForm({ onSubmit, isLoading }: FormProps) {
  const [formData, setFormData] = useState(initialData || {})
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await onSubmit(formData)
      // Handle success (redirect, reset, etc)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  // Form JSX...
}
```

## Authentication Flow Implementation

Update `useAuth` hook once authService is implemented:

```typescript
// In pages/AuthPage.tsx
const { signUp, signIn } = useAuth()

const handleSubmit = async (e: React.FormEvent) => {
  try {
    if (mode === 'login') {
      await signIn(email, password)
    } else {
      await signUp(email, password, username)
    }
    navigate('/') // Redirect to home
  } catch (error) {
    setError((error as Error).message)
  }
}
```

## Styling Guidelines

All components use Tailwind CSS utility classes:

```typescript
// DO: Use Tailwind classes
<div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-blue-500 text-white">

// DON'T: Write custom CSS
<div style={{ display: 'flex', gap: '1rem' }}>
```

Custom component classes defined in `index.css`:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.card`, `.input`, `.textarea`
- `.badge`, `.badge-primary`

## Debugging Tips

1. **Check Supabase connection:**
   ```typescript
   const { data, error } = await supabase.from('users').select('*').limit(1)
   console.log(data, error)
   ```

2. **Verify auth state:**
   ```typescript
   const { useAuth } = useAuth()
   console.log('User:', user, 'IsAuthenticated:', isAuthenticated)
   ```

3. **Check component props:**
   ```typescript
   console.log('Props:', props) // Log at component start
   ```

4. **Test API calls directly:**
   ```typescript
   // In browser console or test file
   import { questionService } from './services/questionService'
   const q = await questionService.getAllQuestions()
   console.log(q)
   ```

## Performance Optimization

When implementing:

1. **Lazy load pages** - Use React Router's lazy loading:
   ```typescript
   const HomePage = lazy(() => import('./websitePages/HomePage'))
   ```

2. **Memoize expensive components:**
   ```typescript
   const QuestionCard = memo(({ question }: Props) => {
     // Component code
   })
   ```

3. **Use debounce for search:**
   ```typescript
   const debouncedSearch = useDebounce(searchTerm, 300)
   useEffect(() => {
     searchService.search(debouncedSearch)
   }, [debouncedSearch])
   ```

4. **Pagination for lists:**
   ```typescript
   const [page, setPage] = useState(1)
   const { data: questions } = await questionService.getAllQuestions(page)
   ```

## Testing Strategy

Add tests as you implement:

```typescript
// questions.test.ts
import { describe, it, expect } from 'vitest'
import { questionService } from './questionService'

describe('questionService', () => {
  it('should fetch all questions', async () => {
    const questions = await questionService.getAllQuestions()
    expect(questions).toBeInstanceOf(Array)
  })
})
```

## Deployment Checklist

Before deploying:

- [ ] All API services are implemented
- [ ] Environment variables are set in production
- [ ] Supabase RLS policies are configured
- [ ] Authentication is working
- [ ] Forms are validated and tested
- [ ] Build completes without errors: `npm run build`
- [ ] No console errors in production build
- [ ] Mobile responsive design is tested
- [ ] Performance is optimized

## Common Issues & Solutions

### "Cannot find module '@supabase/supabase-js'"
- Run `npm install @supabase/supabase-js`

### "useAuth must be used within an AuthProvider"
- Ensure `AuthProvider` wraps the whole app in `main.tsx`

### Build succeeds but app doesn't load
- Check `.env.local` has correct Supabase credentials
- Check browser console for CORS errors

### Unused variable warnings
- Replace with `_ ` prefix if not needed: `const _question = ...`
- Or remove if truly unnecessary

## Next Phase: Advanced Features

Once MVP is complete, consider:

1. **Real-time Updates** - Supabase subscriptions
2. **Comment System** - Nested comments on answers
3. **User Reputation** - Calculate from votes
4. **Advanced Search** - Full-text search with Algolia
5. **Notifications** - Real-time alerts
6. **Admin Panel** - Moderation tools
7. **Analytics** - Track usage and trends
8. **Email** - Notification emails via SendGrid

Good luck with development! 🚀

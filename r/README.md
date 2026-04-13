# CodeFlow - A Modern Q&A Platform

CodeFlow is a web-based question-and-answer platform designed for developers to ask technical questions, share knowledge, and collaborate efficiently. Similar to Stack Overflow, CodeFlow focuses on simplicity, clarity, and performance.

## Project Overview

**Target Users:** Computer science students, software developers, hobby programmers, and technology enthusiasts

**Core Features (MVP):**
- User authentication (sign up, login, logout)
- Post questions with title, description, and tags
- Answer questions and view answers
- Upvote/downvote system for questions and answers
- Basic user profiles
- Search and filter questions by tags or keywords
- Responsive design for desktop and mobile devices

## Tech Stack

- **Frontend:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Backend/Database:** Supabase
- **Icons:** Lucide React
- **Utilities:** clsx for className management

## Project Structure

```
src/
├── components/           # Reusable React components
│   ├── dataDisplay/     # Components for displaying data (QuestionCard, AnswerItem, VoteButton)
│   ├── forms/           # Form components (QuestionForm, AnswerForm)
│   ├── layout/          # Layout components (Header, Navigation, MainLayout)
│   ├── loading-error/   # Loading and error states
│   ├── navtools/        # Navigation tools
│   ├── search-filter/   # Search and filter components
│   └── tools/           # Utility components
├── customHooks/         # Custom React hooks
│   ├── useAuth.ts       # Authentication context and hook
│   ├── useFetch.ts      # Data fetching hook
│   └── useDebounce.ts   # Debounce hook
├── lib/                 # Library configurations
│   └── supabaseClient.ts # Supabase client initialization
├── services/            # API service modules
│   ├── authService.ts   # Authentication API calls
│   ├── questionService.ts # Question CRUD operations
│   ├── answerService.ts  # Answer CRUD operations
│   ├── voteService.ts    # Vote operations
│   ├── tagService.ts     # Tag operations
│   └── userService.ts    # User profile operations
├── types/               # TypeScript type definitions
│   ├── Answer.ts        # Answer type definitions
│   ├── Question.ts      # Question type definitions
│   ├── Tag.ts           # Tag type definitions
│   ├── UserProfile.ts   # User profile type definitions
│   └── Vote.ts          # Vote type definitions
├── websitePages/        # Page components
│   ├── HomePage.tsx     # Home page - list of questions
│   ├── AskQuestionPage.tsx # Page for creating new questions
│   ├── QuestionDetailsPage.tsx # Full question with answers
│   ├── EditQuestionPage.tsx # Edit existing question
│   ├── AuthPage.tsx     # Login/signup page
│   ├── ExplorePage.tsx  # Browse and filter questions
│   ├── TagsPage.tsx     # View all available tags
│   ├── TagDetailsPage.tsx # Questions for a specific tag
│   ├── ProfilePage.tsx  # User profile
│   ├── FavouritesPage.tsx # Saved questions
│   ├── ErrorPage.tsx    # Error boundary page
│   └── NotFoundPage.tsx # 404 page
├── App.tsx              # Main App component
├── Router.tsx           # React Router configuration
├── main.tsx             # Application entry point
├── index.css            # Global styles with Tailwind directives
└── App.css              # App-specific styles

```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Component Architecture

### Layout Components
- **MainLayout:** Wraps all pages with Header and Navigation
- **Header:** Navigation bar with search, user menu
- **Navigation:** Sidebar with category links and tag browser

### Data Display Components
- **QuestionCard:** Compact question preview with stats
- **AnswerItem:** Single answer with voting and edit controls
- **VoteButton:** Interactive upvote/downvote button

### Form Components
- **QuestionForm:** Create/edit questions with tag management
- **AnswerForm:** Compose and submit answers

### Page Components
- Each page component is a complete feature page
- Uses custom hooks for data fetching and state management
- Integrates service modules for API calls

## API Service Structure

All API calls are abstracted into service modules:

- **authService**: Sign up, login, logout, session management
- **questionService**: Create, read, update, delete questions
- **answerService**: Answer management
- **voteService**: Vote on questions/answers
- **tagService**: Tag management and browsing
- **userService**: User profile and stats

## Authentication Flow

1. User signs up/logs in via AuthPage
2. AuthService handles authentication with Supabase
3. useAuth hook provides user context throughout app
4. AuthProvider wraps app for context availability
5. Protected routes can be added to Router for auth-required pages

## Type Safety

All components use TypeScript with strict type checking enabled. Types are centralized in the `types/` directory using `export type` syntax for better tree-shaking.

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Defined in `index.css` as Tailwind components
  - `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
  - `.card`, `.input`, `.textarea`, `.badge`, `.badge-primary`
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Next Steps for Development

1. **Implement API Services:**
   - Fill in service modules with actual Supabase queries
   - Replace TODO comments with real implementations

2. **Add More Components:**
   - loading-error: LoadingSpinner, ErrorAlert
   - search-filter: SearchBar, FilterPanel
   - tools: Pagination, SortDropdown

3. **Implement Features:**
   - Real-time notifications
   - Comment system
   - Question editing/deletion
   - Advanced search with Algolia/Meilisearch

4. **Enhance UI:**
   - Dark mode support
   - More interactive elements
   - Animations and transitions
   - Improved accessibility

5. **Testing:**
   - Add unit tests with Vitest
   - Add integration tests
   - E2E testing with Playwright

6. **Deployment:**
   - Configure Vercel or Netlify
   - Set up CI/CD pipeline
   - Database backups and monitoring

## Performance Considerations

- Code splitting via React Router lazy loading
- Image optimization with responsive images
- Debounced search to reduce API calls
- Efficient state management with React hooks
- CSS optimization with Tailwind purging

## Security

- JWT token-based authentication
- Protected API routes (implemented in backend)
- CORS configured for Supabase
- Input validation on forms
- XSS protection through React's built-in escaping

## Contributing

1. Follow the established folder structure
2. Use TypeScript for all components
3. Use Tailwind CSS for styling
4. Document complex logic with comments
5. Keep components small and focused

## License

This project is part of a learning exercise.

      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

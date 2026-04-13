# CSS Conversion Checklist

This document outlines the CSS conversion from Tailwind to External CSS Files.

## Status: PARTIALLY COMPLETE ✅

### ✅ Completed:
1. **Global Styles** - `src/styles/global.css`
   - All base styles, reset, and utility classes
   - CSS variables for colors
   - Common Tailwind utility classes replicated as custom CSS

2. **Layout Styles** - `src/styles/layout.css`
   - Header, Navigation, MainLayout styles

3. **Page CSS Files** - All created and ready:
   - `src/styles/pages/HomePage.css`
   - `src/styles/pages/AuthPage.css`
   - `src/styles/pages/AskQuestionPage.css`
   - `src/styles/pages/QuestionDetailsPage.css`
   - `src/styles/pages/EditQuestionPage.css`
   - `src/styles/pages/TagsPage.css`
   - `src/styles/pages/TagDetailsPage.css`
   - `src/styles/pages/ProfilePage.css`
   - `src/styles/pages/ExplorePage.css`
   - `src/styles/pages/FavouritesPage.css`
   - `src/styles/pages/AdminDashboard.css`
   - `src/styles/pages/ErrorPage.css`

4. **Component CSS Files** - Created:
   - `src/styles/components/AuthForm.css` ✅
   - `src/styles/components/QuestionForm.css`
   - `src/styles/components/QuestionCard.css` ✅
   - `src/styles/components/AnswerItem.css`

5. **Updated Components**:
   - ✅ `main.tsx` - Imports global.css and layout.css
   - ✅ `HomePage.tsx` - Uses HomePage.css with custom classes
   - ✅ `AuthPage.tsx` - Uses AuthPage.css with custom classes
   - ✅ `AuthForm.tsx` - Uses AuthForm.css with custom classes  
   - ✅ `QuestionCard.tsx` - Uses QuestionCard.css with custom classes
   - ✅ `MainLayout.tsx` - Uses custom classes
   - ✅ `Header.tsx` - Uses custom classes (partially)
   - ⚠️ `Navigation.tsx` - Updated but needs refinement

### Still Need Updating:

#### Page Components:
- [ ] `AskQuestionPage.tsx` - Import AskQuestionPage.css, replace Tailwind classes
- [ ] `QuestionDetailsPage.tsx` - Import QuestionDetailsPage.css, replace classes
- [ ] `EditQuestionPage.tsx` - Import EditQuestionPage.css, replace classes
- [ ] `TagsPage.tsx` - Import TagsPage.css, replace classes
- [ ] `TagDetailsPage.tsx` - Import TagDetailsPage.css, replace classes
- [ ] `ProfilePage.tsx` - Import ProfilePage.css, replace classes
- [ ] `ExplorePage.tsx` - Import ExplorePage.css, replace classes
- [ ] `FavouritesPage.tsx` - Import FavouritesPage.css, replace classes
- [ ] `AdminDashboard.tsx` - Import AdminDashboard.css, replace classes
- [ ] `ErrorPage.tsx` - Import ErrorPage.css, replace classes
- [ ] `NotFoundPage.tsx` - Import ErrorPage.css, replace classes

#### Form Components:
- [x] `AuthForm.tsx` - ✅ Complete
- [ ] `QuestionForm.tsx` - Import QuestionForm.css, replace classes
- [ ] `AnswerForm.tsx` (if exists) - Create CSS and update

#### Data Display Components:
- [x] `QuestionCard.tsx` - ✅ Complete
- [ ] `AnswerItem.tsx` - Import AnswerItem.css, replace classes
- [ ] Other data display components (SearchResults, VoteButtons, etc.)

#### Other Components:
- [ ] All components in `components/tools/`
- [ ] All components in `components/loading-error/`
- [ ] All components in `components/search-filter/`
- [ ] All components in `components/navtools/`

## Pattern Example:

### For each page/component:

**Step 1: Add CSS Import**
```tsx
import '../styles/pages/PageName.css'
// OR
import '../../styles/components/ComponentName.css'
```

**Step 2: Replace Tailwind Classes with Custom Classes**

**Before (Tailwind):**
```tsx
<div className="max-w-4xl mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-8">Title</h1>
  <button className="btn-primary">Button</button>
</div>
```

**After (Custom CSS):**
```tsx
<div className="page-container">
  <h1>Title</h1>
  <button className="btn btn-primary">Button</button>
</div>
```

## Class Name Mapping Reference:

### Layout
- `max-w-3xl mx-auto px-4 py-8` → `page-container` or specific page class
- `flex items-center justify-between` → `flex justify-between items-center`
- `grid grid-cols-2` → `grid grid-cols-2`
- `space-y-4` → Use individual `.mb-4` or container padding

### Text
- `text-3xl font-bold text-gray-900` → Check page CSS for specific class
- `text-gray-600` → `.text-gray-600`
- `font-semibold` → `.font-semibold`

### Colors  
- `bg-blue-500` → `.bg-orange-primary`
- `text-blue-600` → `.text-orange-primary`
- `bg-white` → `.bg-off-white` or `.bg-white`
- `bg-gray-50` → `.bg-gray-50`

### Buttons
- `btn-primary` → `.btn btn-primary`
- `btn-secondary` → `.btn btn-secondary`
- `btn-outline` → `.btn btn-outline`

### Cards
- `.card` → `.card` (already defined in global.css)
- Border and shadow utilities included

### Forms
- `.input` → `.input` or specific form class
- `.textarea` → `.textarea`

## Build Instructions:

```bash
# Build after updates
npm run build

# Verify no TypeScript errors
npm run build 2>&1 | grep -i error
```

## Tips:

1. Use global.css utility classes whenever possible
2. Create semantic class names in page/component CSS files
3. Group related styles together
4. Use CSS variables (--color-*) for consistency
5. Inline critical styles only for layout control (like grid-template-columns)
6. Avoid using leftover Tailwind classes

## Testing Checklist:

After updating each component:
- [ ] Imports are correct
- [ ] All Tailwind classes replaced
- [ ] Build succeeds without errors
- [ ] Visual appearance matches original
- [ ] Responsive design works (if applicable)
- [ ] Hover states work
- [ ] No console errors

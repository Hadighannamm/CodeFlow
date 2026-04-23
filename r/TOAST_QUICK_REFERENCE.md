# Quick Reference - Toast API

## Basic Setup (Already Done! ✅)

1. ✅ Context provider wraps the app in `Router.tsx`
2. ✅ `ToastContainer` added to `MainLayout.tsx`
3. ✅ All components have access to toasts via hook

## Using Toasts in Your Code

### Import
```tsx
import { useToast } from '@/customHooks/useToast'
```

### Hook Setup
```tsx
const toast = useToast()
```

### Display Messages
```tsx
toast.success('Message')           // Green toast
toast.error('Message')             // Red toast
toast.warning('Message')           // Amber toast
toast.info('Message')              // Blue toast
```

### Custom Duration (optional)
```tsx
toast.success('Quick message', 2000)  // 2 seconds
toast.error('Important error', 0)     // Never auto-dismisses
```

## Common Patterns

### Try-Catch with Async/Await
```tsx
const handleClick = async () => {
  try {
    await someAsyncAction()
    toast.success('Success!')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Error occurred')
  }
}
```

### With Error Handler
```tsx
import { useErrorHandler } from '@/lib/errorHandler'

const { errorHandler } = useErrorHandler()

try {
  // code
} catch (error) {
  errorHandler(error, 'Custom fallback message')
}
```

### Form Validation
```tsx
if (!formData.email) {
  toast.warning('Email is required')
  return
}
```

### API Calls
```tsx
const { data, error } = await supabase
  .from('table')
  .select('*')

if (error) {
  toast.error(`Failed to fetch: ${error.message}`)
}
```

## Styling Notes

Each toast type has a unique color scheme:
- **Error**: Red (#fee2e2 bg, #dc2626 border)
- **Success**: Green (#f0fdf4 bg, #16a34a border)
- **Warning**: Amber (#fffbeb bg, #f59e0b border)
- **Info**: Blue (#eff6ff bg, #3b82f6 border)

All use your project's font stack and follow the theme.

## Files Reference

| File | Purpose |
|------|---------|
| `src/context/ToastContext.tsx` | State management |
| `src/customHooks/useToast.ts` | Hook for components |
| `src/components/layout/ToastContainer.tsx` | Renders all toasts |
| `src/components/layout/ToastItem.tsx` | Individual toast |
| `src/styles/components/Toast.css` | Styling & animations |
| `src/lib/errorHandler.ts` | Error utility |

## Positioning

Toasts appear in **top-right corner** by default.

Edit `.toast-container` in [Toast.css](src/styles/components/Toast.css) to change:
```css
/* Top-right (default) */
.toast-container {
  top: 20px;
  right: 20px;
}

/* Top-left */
.toast-container {
  top: 20px;
  left: 20px;
}

/* Bottom-right */
.toast-container {
  bottom: 20px;
  right: 20px;
}
```

## Responsive Behavior

- Desktop: Fixed position, top-right corner
- Mobile: Full width (minus padding), top-right corner

Automatically adapts to screen size via `@media (max-width: 640px)`.

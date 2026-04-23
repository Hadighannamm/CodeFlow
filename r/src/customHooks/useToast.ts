import { useContext, useMemo } from 'react'
import type { ToastType } from '../context/ToastContext'
import { ToastFunctionsContext } from '../context/ToastContext'

export function useToast() {
  const context = useContext(ToastFunctionsContext)
  
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return useMemo(() => ({
    success: (message: string, duration?: number) => context.addToast(message, 'success', duration),
    error: (message: string, duration?: number) => context.addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => context.addToast(message, 'warning', duration),
    info: (message: string, duration?: number) => context.addToast(message, 'info', duration),
    remove: context.removeToast,
    clearAll: context.clearAll,
  }), [context])
}

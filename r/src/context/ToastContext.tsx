import React, { createContext, useCallback, useState, useMemo } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

interface ToastFunctionsContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)
export const ToastFunctionsContext = createContext<ToastFunctionsContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType, duration = 5000) => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, newToast])

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  const contextValue = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    clearAll,
  }), [toasts, addToast, removeToast, clearAll])

  const functionsValue = useMemo(() => ({
    addToast,
    removeToast,
    clearAll,
  }), [addToast, removeToast, clearAll])

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastFunctionsContext.Provider value={functionsValue}>
        {children}
      </ToastFunctionsContext.Provider>
    </ToastContext.Provider>
  )
}

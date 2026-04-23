import { useEffect, useState } from 'react'
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import type { Toast, ToastType } from '../../context/ToastContext'

const toastIcons: Record<ToastType, React.ReactNode> = {
  error: <AlertCircle size={20} />,
  success: <CheckCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
}

const toastClasses: Record<ToastType, string> = {
  error: 'toast-error',
  success: 'toast-success',
  warning: 'toast-warning',
  info: 'toast-info',
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

export default function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Add enter animation
    const timer = setTimeout(() => {
      // Component is mounted
    }, 10)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 300)
  }

  return (
    <div 
      className={`toast-item ${toastClasses[toast.type]} ${isClosing ? 'toast-exit' : 'toast-enter'}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-icon">
        {toastIcons[toast.type]}
      </div>
      <div className="toast-message">
        {toast.message}
      </div>
      <button
        onClick={handleClose}
        className="toast-close"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  )
}

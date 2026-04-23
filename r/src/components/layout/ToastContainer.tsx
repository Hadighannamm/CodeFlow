import { useContext } from 'react'
import { ToastContext } from '../../context/ToastContext'
import ToastItem from './ToastItem'
import '../../styles/components/Toast.css'

export default function ToastContainer() {
  const context = useContext(ToastContext)

  if (!context) {
    return null
  }

  return (
    <div className="toast-container">
      {context.toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={() => context.removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

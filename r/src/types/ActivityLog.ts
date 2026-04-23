export type ActivityLog = {
  id: string
  adminId: string
  adminName?: string
  action: string
  targetType?: string
  targetId?: string
  details?: Record<string, any>
  createdAt: string
}

export type ReportType = 'question' | 'answer' | 'user'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other'

export type Report = {
  id: string
  type: ReportType
  targetId: string
  targetUserId?: string
  reportedById: string
  reportedByName?: string
  reason: ReportReason
  description?: string
  status: ReportStatus
  resolutionNote?: string
  resolvedById?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export type CreateReportInput = {
  type: ReportType
  targetId: string
  reason: ReportReason
  description?: string
}

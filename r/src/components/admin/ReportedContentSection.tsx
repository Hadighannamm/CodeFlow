import { AlertTriangle, Trash2 } from 'lucide-react'
import type { AdminReportedContentItem } from '../../services/adminService'

type ReportedContentSectionProps = {
  items: AdminReportedContentItem[]
  onIgnoreReport: (reportId: string) => void
  onDeleteContent: (item: AdminReportedContentItem) => void
}

function formatDate(dateText: string) {
  return new Date(dateText).toLocaleDateString()
}

export default function ReportedContentSection({
  items,
  onIgnoreReport,
  onDeleteContent,
}: ReportedContentSectionProps) {
  return (
    <div className="reported-content-section">
      <h3>Reported / Flagged Content</h3>
      {items.length === 0 ? (
        <p className="no-data">No reported questions or answers right now.</p>
      ) : (
        <div className="reports-container">
          {items.map((item) => (
            <div key={item.reportId} className="report-card report-card-moderation">
              <div className="report-header">
                <div className="report-header-left">
                  <span className="report-type">{item.type}</span>
                  <span className={`report-status ${item.status}`}>{item.status}</span>
                </div>
                <p className="report-meta">Reported {formatDate(item.createdAt)}</p>
              </div>

              <div className="report-body">
                <p>
                  <strong>Reason:</strong> {item.reason}
                </p>
                {item.description && (
                  <p>
                    <strong>Details:</strong> {item.description}
                  </p>
                )}
                <p>
                  <strong>Reported by:</strong> {item.reporterName}
                </p>
                <p>
                  <strong>Author:</strong> {item.authorName}
                </p>
                <p>
                  <strong>Content:</strong> {item.titleOrSnippet}
                </p>
              </div>

              <div className="report-actions">
                <button
                  type="button"
                  className="btn-secondary btn-inline-icon"
                  onClick={() => onIgnoreReport(item.reportId)}
                >
                  <AlertTriangle size={14} />
                  Ignore Report
                </button>
                <button
                  type="button"
                  className="btn-danger btn-inline-icon"
                  onClick={() => onDeleteContent(item)}
                >
                  <Trash2 size={14} />
                  Delete Content
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

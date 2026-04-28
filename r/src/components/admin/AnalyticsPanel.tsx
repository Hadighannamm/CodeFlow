import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'

type DayCount = { label: string; count: number }

function Sparkline({ data }: { data: number[] }) {
  const width = 200
  const height = 40
  if (!data || data.length === 0) return <svg width={width} height={height} />
  const max = Math.max(...data)
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1 || 1)) * width
      const y = max === 0 ? height : height - (v / max) * height
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={width} height={height}>
      <polyline fill="none" stroke="#3b82f6" strokeWidth={2} points={points} />
    </svg>
  )
}

function BarChart({ data }: { data: DayCount[] }) {
  const width = 400
  const height = 120
  const max = data.reduce((m, d) => Math.max(m, d.count), 0)
  const barW = Math.max(8, Math.floor(width / Math.max(1, data.length)) - 6)
  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        const x = i * (barW + 6) + 4
        const h = max === 0 ? 0 : (d.count / max) * (height - 20)
        const y = height - h - 16
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={h} fill="#10b981" />
            <text x={x + barW / 2} y={height - 4} fontSize={10} textAnchor="middle" fill="#374151">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function AnalyticsPanel() {
  const [stats, setStats] = useState<any>(null)
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [topQuestions, setTopQuestions] = useState<any[]>([])
  const [activityByDay, setActivityByDay] = useState<DayCount[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const s = await adminService.getDashboardStats()
        setStats(s)

        const mu = await adminService.getMostActiveUsers(5)
        if (mu.data) setTopUsers(mu.data)

        const mq = await adminService.getMostAnsweredQuestions(5)
        if (mq.data) setTopQuestions(mq.data)

        const logsRes = await adminService.getActivityLogs(200)
        const logs = logsRes.data || []
        // compute last 12 months counts
        const months: Record<string, number> = {}
        const monthLabels: string[] = []
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        const now = new Date()
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const key = `${d.getFullYear()}-${d.getMonth()}`
          months[key] = 0
          monthLabels.push(key)
        }
        for (const l of logs) {
          const date = new Date(l.createdAt || l.createdAt || Date.now())
          const key = `${date.getFullYear()}-${date.getMonth()}`
          if (key in months) months[key]++
        }
        const monthData = monthLabels.map((k) => {
          const [, m] = k.split('-')
          const label = monthNames[Number(m)]
          return { label, count: months[k] }
        })
        setActivityByDay(monthData)
      } catch (err) {
        console.error('Failed to load analytics', err)
      }
    }
    load()
  }, [])

  return (
    <div className="analytics-panel">
      <div className="analytics-header">
        <h2>Advanced Analytics</h2>
        <p className="subtle-text">Key metrics and recent activity trends</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Users</h3>
          <div className="analytics-value">{stats?.totalUsers ?? '—'}</div>
          <Sparkline data={[(stats?.totalUsers || 0) - 3, (stats?.totalUsers || 0) - 1, stats?.totalUsers || 0]} />
        </div>

        <div className="analytics-card">
          <h3>Total Questions</h3>
          <div className="analytics-value">{stats?.totalQuestions ?? '—'}</div>
          <Sparkline data={[(stats?.totalQuestions || 0) - 2, (stats?.totalQuestions || 0) - 1, stats?.totalQuestions || 0]} />
        </div>

        <div className="analytics-card">
          <h3>Total Answers</h3>
          <div className="analytics-value">{stats?.totalAnswers ?? '—'}</div>
          <Sparkline data={[(stats?.totalAnswers || 0) - 1, stats?.totalAnswers || 0 - 0, stats?.totalAnswers || 0]} />
        </div>

        <div className="analytics-card wide">
          <h3>Activity (last 12 months)</h3>
          <BarChart data={activityByDay} />
        </div>

        <div className="analytics-card">
          <h3>Top Active Users</h3>
          <ul className="small-list">
            {topUsers.map((u) => (
              <li key={u.id}>{u.username} — {u.reputation}</li>
            ))}
          </ul>
        </div>

       
      </div>
    </div>
  )
}

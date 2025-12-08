import React, { useEffect, useMemo, useState } from 'react'
import IncentivesSummary from '../components/IncentivesSummary'
import { fetchActivityFeed, joinPool } from '../services/neighborhoodApi'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../contexts/ToastContext'

type FeedFilter = 'upcoming' | 'recent' | 'all'

interface FeedItem {
  id: string
  type: string
  displayText: string
  createdAt: string
  isJoinable: boolean
  poolId?: string | null
}

const filters: { label: string, value: FeedFilter, helper: string }[] = [
  { label: 'Upcoming', value: 'upcoming', helper: 'Next 2 hours' },
  { label: 'Recent', value: 'recent', helper: 'Last 24 hours' },
  { label: 'All', value: 'all', helper: 'Nearby and timely' }
]

const formatRelativeTime = (isoDate: string) => {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const minutes = Math.round(Math.abs(diffMs) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return diffMs >= 0 ? `in ${minutes} min` : `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  return diffMs >= 0 ? `in ${hours} hr` : `${hours} hr ago`
}

export default function NeighborhoodPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const userId = useMemo(() => user?.uid || (user as any)?.id || 'user-1', [user])

  const [filter, setFilter] = useState<FeedFilter>('upcoming')
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [joiningPoolId, setJoiningPoolId] = useState<string | null>(null)
  const [summaryRefresh, setSummaryRefresh] = useState(0)

  const loadFeed = async (selectedFilter: FeedFilter = filter) => {
    try {
      setLoading(true)
      setError('')
      const items = await fetchActivityFeed(selectedFilter, 20, userId)
      setFeedItems(items)
    } catch (err: any) {
      setError(err?.message || 'Unable to load activity right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeed(filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleJoin = async (poolId?: string | null) => {
    if (!poolId) return
    setJoiningPoolId(poolId)
    try {
      await joinPool(poolId, userId)
      showToast('You joined the pool and earned a $2 discount!')
      await loadFeed(filter)
      setSummaryRefresh((v) => v + 1)
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Unable to join this pool right now.', 'error')
    } finally {
      setJoiningPoolId(null)
    }
  }

  return (
    <div className="neighborhood-layout">
      <div className="neighborhood-feed">
        <header className="page-header">
          <div>
            <p className="eyebrow">Neighborhood</p>
            <h2>Activity Feed</h2>
            <p className="muted">See what neighbors are pooling nearby and jump into a trip.</p>
          </div>
          <div className="filter-row">
            {filters.map(f => (
              <button
                key={f.value}
                className={`filter-chip ${filter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                <span>{f.label}</span>
                <small>{f.helper}</small>
              </button>
            ))}
          </div>
        </header>

        {loading && <div className="muted">Loading nearby activity...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div className="feed-list">
            {feedItems.map(item => (
              <div key={item.id} className="feed-card">
                <div>
                  <div className="feed-text">{item.displayText}</div>
                  <div className="muted">{formatRelativeTime(item.createdAt)}</div>
                </div>
                {item.isJoinable && (
                  <button
                    className="join-btn"
                    disabled={joiningPoolId === item.poolId}
                    onClick={() => handleJoin(item.poolId)}
                  >
                    {joiningPoolId === item.poolId ? 'Joining...' : 'Join this pool'}
                  </button>
                )}
              </div>
            ))}
            {feedItems.length === 0 && <div className="muted">No activity matches this filter.</div>}
          </div>
        )}
      </div>

      <div className="neighborhood-sidebar">
        <IncentivesSummary userId={userId} refreshToken={summaryRefresh} />
      </div>
    </div>
  )
}

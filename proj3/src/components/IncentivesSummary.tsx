import React, { useEffect, useState } from 'react'
import { fetchIncentivesSummary, updatePrivacyPreference } from '../services/neighborhoodApi'
import { useToast } from '../contexts/ToastContext'

type PrivacyPreference = 'PUBLIC_NAME' | 'ANONYMOUS_NEIGHBOR'

interface LedgerEntry {
  id: string
  amountCents: number
  description?: string
  sourceType: string
  sourceId?: string | null
  createdAt: string
}

interface IncentivesSummaryProps {
  userId?: string
  refreshToken?: number
}

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`

export default function IncentivesSummary({ userId, refreshToken = 0 }: IncentivesSummaryProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<{ totalCreditsCents: number; lifetimeSavingsCents: number; recentEntries: LedgerEntry[]; privacyPreference?: PrivacyPreference } | null>(null)
  const [privacyPreference, setPrivacyPreference] = useState<PrivacyPreference>('PUBLIC_NAME')

  useEffect(() => {
    loadSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const data = await fetchIncentivesSummary(userId)
      setSummary(data)
      if (data.privacyPreference) {
        setPrivacyPreference(data.privacyPreference)
      }
    } catch (error) {
      showToast('Unable to load incentives', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePrivacyChange = async (value: PrivacyPreference) => {
    setPrivacyPreference(value)
    try {
      await updatePrivacyPreference(value, userId)
      showToast('Privacy preference updated')
    } catch (error) {
      showToast('Could not update privacy', 'error')
    }
  }

  return (
    <div className="incentives-card">
      <div className="card-header">
        <h3>Pooling Incentives</h3>
        <p className="muted">Track your pooling savings and adjust privacy.</p>
      </div>

      {loading && <p className="muted">Loading summary...</p>}
      {!loading && summary && (
        <>
          <div className="totals">
            <div>
              <div className="label">Total Credits</div>
              <div className="value">{formatCurrency(summary.totalCreditsCents)}</div>
            </div>
            <div>
              <div className="label">Lifetime Savings</div>
              <div className="value">{formatCurrency(summary.lifetimeSavingsCents)}</div>
            </div>
          </div>

          <div className="privacy-row">
            <div>
              <div className="label">Privacy</div>
              <div className="muted">Control how your name appears in the feed.</div>
            </div>
            <select
              value={privacyPreference}
              onChange={(e) => handlePrivacyChange(e.target.value as PrivacyPreference)}
            >
              <option value="PUBLIC_NAME">Show first name</option>
              <option value="ANONYMOUS_NEIGHBOR">Show as "A neighbor"</option>
            </select>
          </div>

          <div className="ledger">
            <div className="label">Recent incentives</div>
            {summary.recentEntries.length === 0 && <p className="muted">No incentives recorded yet.</p>}
            {summary.recentEntries.map(entry => (
              <div key={entry.id} className="ledger-row">
                <span>{entry.description || entry.sourceType}</span>
                <span className={entry.amountCents >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(entry.amountCents)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

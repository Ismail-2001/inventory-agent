import { useEffect, useState } from 'react'
import { api, type MetricsResponse, type RunSyncResponse } from '../lib/api'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [syncResult, setSyncResult] = useState<RunSyncResponse | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    api.getMetrics(7).then(setMetrics).catch(() => {})
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await api.runSync()
      setSyncResult(res)
      api.getMetrics(7).then(setMetrics).catch(() => {})
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSyncing(false)
    }
  }

  const acc = metrics?.acceptance
  const fore = metrics?.forecast_error

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Dashboard</h2>
          <p className="mt-1 text-[13.5px] text-ink-muted">Inventory overview and key metrics</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-ink-on-accent transition-colors hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-40"
        >
          {syncing ? 'Syncing…' : 'Run Sync'}
        </button>
      </div>

      {syncResult && (
        <div className="rounded-lg border border-accent/20 bg-accent-bg p-4 font-mono text-[12.5px] text-accent">
          Synced {syncResult.synced_products} products, {syncResult.synced_sales} sales.&nbsp;
          {syncResult.risk_alerts > 0 && `${syncResult.risk_alerts} risk alerts, `}
          {syncResult.purchase_orders > 0 && `${syncResult.purchase_orders} POs drafted.`}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Accepted (as-is)" value={acc ? `${acc.accepted_as_is_pct}%` : '—'} sub={acc ? `${acc.accepted_as_is} of ${acc.total}` : ''} tone="healthy" />
        <StatCard label="Edited then Approved" value={acc ? `${acc.edited_then_approved_pct}%` : '—'} sub={acc ? `${acc.edited_then_approved} orders` : ''} tone="warning" />
        <StatCard label="Rejected" value={acc ? `${acc.rejected_pct}%` : '—'} sub={acc ? `${acc.rejected} orders` : ''} tone="critical" />
        <StatCard label="Forecast Error" value={fore ? `${fore.mean_error_pct}%` : '—'} sub={fore ? `from ${fore.count} outcomes` : ''} tone="default" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h3 className="mb-3 text-[13px] font-medium text-ink-muted">Recent Sync</h3>
          {syncResult ? (
            <div className="space-y-1.5 font-mono text-[12.5px] text-ink-muted">
              <p>Products synced: <span className="tabular text-ink">{syncResult.synced_products}</span></p>
              <p>Sales records: <span className="tabular text-ink">{syncResult.synced_sales}</span></p>
              <p>Risk alerts: <span className="tabular text-ink">{syncResult.risk_alerts}</span></p>
              <p>POs drafted: <span className="tabular text-ink">{syncResult.purchase_orders}</span></p>
            </div>
          ) : (
            <p className="text-[13px] text-ink-faint">Run a sync to see results</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <h3 className="mb-3 text-[13px] font-medium text-ink-muted">Forecast Accuracy</h3>
          {fore ? (
            <div className="space-y-1.5 font-mono text-[12.5px] text-ink-muted">
              <p>Mean error: <span className="tabular font-medium text-ink">{fore.mean_error_pct}%</span></p>
              <p>Range: <span className="tabular text-ink">{fore.min_error_pct}% – {fore.max_error_pct}%</span></p>
              <p>Stockout rate: <span className="tabular text-ink">{fore.stockout_rate}%</span></p>
            </div>
          ) : (
            <p className="text-[13px] text-ink-faint">Not enough outcome data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: 'healthy' | 'warning' | 'critical' | 'default' }) {
  const toneClass: Record<string, string> = {
    healthy: 'text-healthy',
    warning: 'text-warning',
    critical: 'text-critical',
    default: 'text-ink',
  }
  return (
    <div className="rounded-lg bg-surface-sunken p-4">
      <p className="text-[13px] text-ink-muted">{label}</p>
      <p className={`tabular mt-1 text-2xl font-medium ${toneClass[tone]}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-ink-faint">{sub}</p>
    </div>
  )
}

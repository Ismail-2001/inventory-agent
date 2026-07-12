import { useEffect, useState } from 'react'
import { api, type MetricsResponse } from '../lib/api'

export default function Analytics() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [weekloading, setWeekloading] = useState(false)
  const [evalLoading, setEvalLoading] = useState(false)

  useEffect(() => {
    api.getMetrics(30).then(setMetrics).catch(() => {})
  }, [])

  const handleWeekly = async () => {
    setWeekloading(true)
    try {
      const res = await api.triggerWeekly()
      alert(`Weekly report generated: ${res.insights_count} insights`)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setWeekloading(false)
    }
  }

  const handleEval = async () => {
    setEvalLoading(true)
    try {
      const res = await api.triggerOutcomeEval()
      alert(`Evaluated ${res.evaluated} pending outcomes`)
      api.getMetrics(30).then(setMetrics).catch(() => {})
    } catch (e: any) {
      alert(e.message)
    } finally {
      setEvalLoading(false)
    }
  }

  const acc = metrics?.acceptance
  const fore = metrics?.forecast_error

  const barData = [
    { label: 'Accepted As-Is', value: acc?.accepted_as_is_pct ?? 0, tone: 'healthy' },
    { label: 'Edited & Approved', value: acc?.edited_then_approved_pct ?? 0, tone: 'warning' },
    { label: 'Rejected', value: acc?.rejected_pct ?? 0, tone: 'critical' },
  ] as const

  const barTone: Record<string, string> = {
    healthy: 'bg-healthy',
    warning: 'bg-warning',
    critical: 'bg-critical',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Analytics</h2>
          <p className="mt-1 text-[13.5px] text-ink-muted">Agent performance and forecast accuracy</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEval}
            disabled={evalLoading}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
          >
            {evalLoading ? 'Evaluating…' : 'Evaluate Outcomes'}
          </button>
          <button
            onClick={handleWeekly}
            disabled={weekloading}
            className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-ink-on-accent transition-colors hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-40"
          >
            {weekloading ? 'Running…' : 'Run Weekly Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h3 className="mb-4 text-[13px] font-medium text-ink-muted">PO Acceptance Rates</h3>
          {acc ? (
            <div className="space-y-4">
              {barData.map(d => (
                <div key={d.label}>
                  <div className="mb-1 flex justify-between text-[13px] text-ink-muted">
                    <span>{d.label}</span>
                    <span className="tabular font-medium text-ink">{d.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                    <div
                      className={`h-full rounded-full transition-all ${barTone[d.tone]}`}
                      style={{ width: `${d.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-ink-faint">No PO data yet</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <h3 className="mb-4 text-[13px] font-medium text-ink-muted">Forecast Error Distribution</h3>
          {fore ? (
            <div className="space-y-4">
              <div className="flex h-32 items-end gap-3">
                <div className="flex flex-1 flex-col items-center">
                  <span className="tabular text-lg font-medium">{fore.min_error_pct}%</span>
                  <span className="mt-1 text-[11px] text-ink-faint">Min</span>
                  <div className="mt-1 w-full rounded-t bg-surface-sunken" style={{ height: '24px' }} />
                </div>
                <div className="flex flex-1 flex-col items-center">
                  <span className="tabular text-lg font-medium">{fore.mean_error_pct}%</span>
                  <span className="mt-1 text-[11px] text-ink-faint">Mean</span>
                  <div className="mt-1 w-full rounded-t bg-accent" style={{ height: '48px' }} />
                </div>
                <div className="flex flex-1 flex-col items-center">
                  <span className="tabular text-lg font-medium">{fore.max_error_pct}%</span>
                  <span className="mt-1 text-[11px] text-ink-faint">Max</span>
                  <div className="mt-1 w-full rounded-t bg-surface-sunken" style={{ height: '24px' }} />
                </div>
              </div>
              <p className="text-center font-mono text-[12px] text-ink-muted">
                Based on {fore.count} evaluated outcome{fore.count !== 1 ? 's' : ''} · Stockout rate: {fore.stockout_rate}%
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-ink-faint">Not enough outcome data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

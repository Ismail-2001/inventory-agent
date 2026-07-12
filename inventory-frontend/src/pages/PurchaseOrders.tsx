import { useEffect, useState } from 'react'
import { api, type PurchaseOrder } from '../lib/api'
import { cn, formatDate, statusColor } from '../lib/utils'

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [approving, setApproving] = useState<number | null>(null)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/v1/po', { headers: { 'X-API-Key': 'demo-key-2024' } })
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch { }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleApprove = async (po: PurchaseOrder, e: React.FormEvent) => {
    e.preventDefault()
    setApproving(po.id)
    try {
      const form = e.target as HTMLFormElement
      const data = new FormData(form)
      const qty = data.get('quantity') ? Number(data.get('quantity')) : undefined
      await api.approvePO(po.id, qty)
      await fetchOrders()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async (po: PurchaseOrder) => {
    const reason = prompt('Reason for rejection (optional):')
    if (reason === null) return
    setApproving(po.id)
    try {
      await api.rejectPO(po.id, reason || undefined)
      await fetchOrders()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setApproving(null)
    }
  }

  const pending = orders.filter(o => o.status === 'pending_approval')
  const history = orders.filter(o => o.status !== 'pending_approval')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Purchase Orders</h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">Nothing here goes to a supplier until you approve it.</p>
      </div>

      {pending.length > 0 && (
        <section>
          <h3 className="mb-3 text-[13px] font-medium text-ink-muted">Awaiting your decision · {pending.length}</h3>
          <div className="space-y-3">
            {pending.map(po => (
              <div key={po.id} className="rounded-lg border border-border bg-surface p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium">PO #{po.id}</p>
                    <p className="mt-0.5 text-[13px] text-ink-muted">Created {formatDate(po.created_at)}</p>
                  </div>
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', statusColor(po.status))}>
                    {po.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-4 rounded-md bg-surface-sunken p-3">
                  <div>
                    <p className="text-[11px] text-ink-faint">Quantity</p>
                    <p className="tabular mt-0.5 text-[15px] font-medium">
                      {po.quantity} units
                      {po.original_quantity && po.edited_before_approval && (
                        <span className="ml-2 text-[12px] font-normal text-ink-faint">(originally {po.original_quantity})</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-ink-faint">Total</p>
                    <p className="tabular mt-0.5 text-[15px] font-medium">${po.total_cost.toFixed(2)}</p>
                  </div>
                </div>

                {po.reasoning_text && (
                  <div className="mb-4 rounded-md border border-border p-3">
                    <p className="mb-1 text-[11px] uppercase tracking-wide text-ink-faint">Why</p>
                    <p className="font-mono text-[12.5px] leading-relaxed text-ink-muted">{po.reasoning_text}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <form onSubmit={(e) => handleApprove(po, e)} className="flex items-center gap-2">
                    <input
                      name="quantity"
                      type="number"
                      defaultValue={po.quantity}
                      className="tabular h-8 w-20 rounded-md border border-border-strong bg-surface px-2 text-[13px]"
                    />
                    <button
                      type="submit"
                      disabled={approving === po.id}
                      className="inline-flex h-8 items-center justify-center rounded-md bg-accent px-3 text-[13px] font-medium text-ink-on-accent transition-colors hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-40"
                    >
                      {approving === po.id ? '…' : 'Approve'}
                    </button>
                  </form>
                  <button
                    onClick={() => handleReject(po)}
                    disabled={approving === po.id}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-critical/30 bg-surface px-3 text-[13px] font-medium text-critical transition-colors hover:bg-critical-bg disabled:pointer-events-none disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-[13px] font-medium text-ink-muted">History</h3>
        {history.length === 0 ? (
          <p className="text-[13px] text-ink-faint">No PO history yet</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-2.5 font-medium">PO</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map(po => (
                  <tr key={po.id} className="border-b border-border last:border-0 hover:bg-surface-sunken/60">
                    <td className="px-4 py-3 font-medium">#{po.id}</td>
                    <td className="tabular px-4 py-3 text-right">{po.quantity}</td>
                    <td className="tabular px-4 py-3 text-right">${po.total_cost.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', statusColor(po.status))}>
                        {po.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(po.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

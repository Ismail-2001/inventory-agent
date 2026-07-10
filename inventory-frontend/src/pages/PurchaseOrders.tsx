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
        <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
        <p className="text-sm text-gray-500 mt-1">Review, approve, or reject AI-generated POs</p>
      </div>

      {pending.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pending Approval</h3>
          <div className="space-y-3">
            {pending.map(po => (
              <div key={po.id} className="bg-white rounded-xl border border-amber-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">PO #{po.id}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Created {formatDate(po.created_at)}</p>
                  </div>
                  <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', statusColor(po.status))}>
                    {po.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Quantity: <span className="font-medium">{po.quantity}</span> units
                  {po.original_quantity && po.edited_before_approval && (
                    <span className="text-gray-400 ml-2">(originally {po.original_quantity})</span>
                  )}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  Total: <span className="font-medium">${po.total_cost.toFixed(2)}</span>
                </p>
                {po.reasoning_text && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">{po.reasoning_text}</p>
                )}
                <div className="flex gap-3">
                  <form onSubmit={(e) => handleApprove(po, e)} className="flex items-center gap-2">
                    <input
                      name="quantity"
                      type="number"
                      defaultValue={po.quantity}
                      className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                    />
                    <button
                      type="submit"
                      disabled={approving === po.id}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {approving === po.id ? '...' : 'Approve'}
                    </button>
                  </form>
                  <button
                    onClick={() => handleReject(po)}
                    disabled={approving === po.id}
                    className="px-4 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 border border-red-200 disabled:opacity-50"
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
        <h3 className="text-sm font-semibold text-gray-900 mb-3">History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No PO history yet</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">PO</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Qty</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map(po => (
                  <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{po.id}</td>
                    <td className="px-4 py-3 text-right">{po.quantity}</td>
                    <td className="px-4 py-3 text-right">${po.total_cost.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', statusColor(po.status))}>
                        {po.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(po.created_at)}</td>
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

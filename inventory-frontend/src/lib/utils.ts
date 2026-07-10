export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function statusColor(status: string): string {
  switch (status) {
    case 'approved': return 'text-green-600 bg-green-50 border-green-200'
    case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
    case 'pending_approval': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'draft': return 'text-gray-600 bg-gray-50 border-gray-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function riskColor(level: string): string {
  switch (level) {
    case 'critical': return 'text-red-700 bg-red-50'
    case 'warning': return 'text-amber-700 bg-amber-50'
    default: return 'text-green-700 bg-green-50'
  }
}

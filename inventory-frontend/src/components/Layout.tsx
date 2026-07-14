import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, ClipboardCheck, Boxes, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutGrid },
  { path: '/inventory', label: 'Inventory', icon: Boxes },
  { path: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardCheck },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-2 px-5 py-5">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent-hover text-ink-on-accent shadow-[0_2px_10px_-2px_rgba(43,58,103,0.5)]"
          >
            <Boxes className="h-4 w-4" />
          </motion.div>
          <div>
            <p className="text-sm font-medium leading-none">Inventory</p>
            <p className="mt-1 text-[11px] leading-none text-ink-faint">AI Employee #2</p>
          </div>
        </div>
        <nav className="relative flex-1 space-y-0.5 px-3">
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] transition-colors',
                  active ? 'font-medium text-accent' : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-md bg-accent-bg"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border px-4 py-4 font-mono text-[11px] text-ink-faint">
          v1.0.0
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-paper p-6">
        {children}
      </main>
    </div>
  )
}

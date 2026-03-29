import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Table2,
  ShieldAlert,
  GitCompare,
  BrainCircuit,
  Shield,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/mapping', label: 'Mapping Table', icon: Table2 },
  { to: '/csp-coverage', label: 'CSP Coverage', icon: ShieldAlert },
  { to: '/cross-reference', label: 'Cross-Reference', icon: GitCompare },
  { to: '/ai-containers', label: 'AI & Containers', icon: BrainCircuit },
];

const SOURCE_LINKS = [
  { label: 'ISM (cyber.gov.au)', href: 'https://www.cyber.gov.au/resources-business-and-government/essential-cyber-security/ism' },
  { label: 'ISO 27001 (iso.org)', href: 'https://www.iso.org/standard/27001' },
  { label: 'AWS Compliance', href: 'https://aws.amazon.com/compliance' },
  { label: 'Azure Trust Centre', href: 'https://www.microsoft.com/en-us/trust-center' },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-200 dark:border-slate-700">
        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
          CloudComply
        </span>
      </div>
      <nav className="flex-1 px-2 py-4 flex flex-col">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  'sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
        <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700">
          <NavLink
            to="/about"
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                'sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )
            }
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>About</span>
          </NavLink>
        </div>
      </nav>
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">Sources</p>
        {SOURCE_LINKS.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 truncate"
          >
            {label}
          </a>
        ))}
      </div>
    </>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <SidebarContent onNavClick={onClose} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}

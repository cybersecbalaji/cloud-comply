import { Moon, Sun, Menu } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { darkMode, toggleDarkMode } = useStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100 md:hidden">
          CloudComply
        </h1>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          ISM: March 2026 | ISO 27001:2022
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
          Australian ISM &amp; ISO 27001 Cloud Compliance Mapper
        </span>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}

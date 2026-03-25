import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your filters or search term.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <SearchX className="w-10 h-10 text-slate-300 dark:text-slate-600" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
    </div>
  );
}

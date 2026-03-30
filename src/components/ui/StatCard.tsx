import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  colour: string;
  subtext?: string;
  accentClass?: string;
}

export function StatCard({ label, value, colour, subtext, accentClass }: StatCardProps) {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-1', accentClass)}>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className={cn('text-3xl font-bold', colour)}>{value}</p>
      {subtext && <p className="text-xs text-slate-400 dark:text-slate-500">{subtext}</p>}
    </div>
  );
}

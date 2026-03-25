import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Badge({ children, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap',
        className
      )}
    >
      {children}
    </span>
  );
}

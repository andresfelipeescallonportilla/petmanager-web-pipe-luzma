import { cn } from '@/lib/utils'

export const STATUS_LABEL: Record<string, string> = {
  Healthy: 'Sano',
  Sick: 'Enfermo',
  'In Surgery': 'En cirugía',
}

export const STATUS_COLOR: Record<string, string> = {
  Healthy: 'bg-emerald-600',
  Sick: 'bg-rose-600',
  'In Surgery': 'bg-amber-500',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs">
      <span className={cn('size-2 rounded-full', STATUS_COLOR[status] ?? 'bg-muted-foreground')} aria-hidden />
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

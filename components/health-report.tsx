import type { Pet } from '@/lib/pets'
import { STATUS_COLOR, STATUS_LABEL } from '@/components/status-badge'
import { cn } from '@/lib/utils'

const HEALTH = ['Healthy', 'Sick', 'In Surgery']

export function HealthReport({ title, pets }: { title: string; pets: Pet[] }) {
  const counts = HEALTH.map((h) => ({ status: h, count: pets.filter((p) => p.healthStatus === h).length }))
  const max = Math.max(1, ...counts.map((c) => c.count))

  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-muted-foreground">{pets.length} total</span>
      </div>
      <ul className="flex flex-col gap-3">
        {counts.map((c) => (
          <li key={c.status} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span>{STATUS_LABEL[c.status]}</span>
              <span className="tabular-nums text-muted-foreground">{c.count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="presentation">
              <div className={cn('h-full rounded-full', STATUS_COLOR[c.status])} style={{ width: `${(c.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

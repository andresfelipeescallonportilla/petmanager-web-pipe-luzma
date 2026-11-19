'use client'

import { useCallback, useState } from 'react'
import type { Pet, PetType } from '@/lib/pets'
import { PetForm } from '@/components/pet-form'
import { PetTable } from '@/components/pet-table'
import { cn } from '@/lib/utils'

type Tab = 'all' | PetType

export function PetManager({ pets }: { pets: Pet[] }) {
  const [tab, setTab] = useState<Tab>('all')
  const [editing, setEditing] = useState<Pet | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [message, setMessage] = useState<{ ok: boolean; message: string } | null>(null)

  const visible = tab === 'all' ? pets : pets.filter((p) => p.type === tab)
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all', label: 'Todas', count: pets.length },
    { id: 'Dog', label: 'Perros', count: pets.filter((p) => p.type === 'Dog').length },
    { id: 'Cat', label: 'Gatos', count: pets.filter((p) => p.type === 'Cat').length },
  ]

  const done = useCallback(() => {
    setEditing(null)
    setFormKey((k) => k + 1)
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div role="tablist" aria-label="Filtrar mascotas" className="flex gap-1 self-start rounded-lg bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === t.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label} <span className="tabular-nums text-muted-foreground">{t.count}</span>
            </button>
          ))}
        </div>
        <div role="status" aria-live="polite">
          {message && (
            <p className={cn('rounded-md border px-3 py-2 text-sm', message.ok ? 'border-emerald-600/40 bg-emerald-600/10 text-emerald-800' : 'border-destructive/40 bg-destructive/10 text-destructive')}>
              {message.message}
            </p>
          )}
        </div>
        <PetTable
          pets={visible}
          onMessage={setMessage}
          onEdit={(p) => {
            setEditing(p)
            setFormKey((k) => k + 1)
          }}
        />
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <PetForm key={formKey} editing={editing} defaultType={tab === 'Cat' ? 'Cat' : 'Dog'} onDone={done} onMessage={setMessage} />
      </div>
    </div>
  )
}

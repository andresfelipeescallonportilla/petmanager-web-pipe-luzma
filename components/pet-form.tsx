'use client'

import { useActionState, useEffect, useState } from 'react'
import { savePet, type ActionState } from '@/app/actions'
import type { Pet, PetType } from '@/lib/pets'
import { Button } from '@/components/ui/button'
import { STATUS_LABEL } from '@/components/status-badge'

const HEALTH = ['Sick', 'Healthy', 'In Surgery']
const inputClass =
  'h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function PetForm({
  editing,
  defaultType,
  onDone,
  onMessage,
}: {
  editing: Pet | null
  defaultType: PetType
  onDone: () => void
  onMessage: (msg: { ok: boolean; message: string }) => void
}) {
  const [type, setType] = useState<PetType>(editing?.type ?? defaultType)
  const [state, action, pending] = useActionState<ActionState, FormData>(savePet, null)

  useEffect(() => {
    if (!state) return
    onMessage(state)
    if (state.ok) onDone()
  }, [state, onMessage, onDone])

  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{editing ? `Editar ${editing.name}` : 'Nueva mascota'}</h2>
        {editing && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancelar
          </Button>
        )}
      </div>

      <input type="hidden" name="petId" value={editing?.petId ?? ''} />
      <input type="hidden" name="type" value={type} />

      <fieldset className="flex gap-2" disabled={Boolean(editing)}>
        <legend className="sr-only">Tipo de mascota</legend>
        {(['Dog', 'Cat'] as const).map((t) => (
          <Button key={t} type="button" variant={type === t ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setType(t)} aria-pressed={type === t}>
            {t === 'Dog' ? 'Perro' : 'Gato'}
          </Button>
        ))}
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Código" name="code" defaultValue={editing?.code} />
        <Field label="Nombre" name="name" defaultValue={editing?.name} />
        <Field label="Año de nacimiento" name="bornYear" type="number" defaultValue={editing?.bornYear?.toString()} />
        <Field label="Color" name="color" defaultValue={editing?.color} />
        <Field label="Raza" name="breed" defaultValue={editing?.breed} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Estado de salud</span>
          <select name="healthStatus" defaultValue={editing?.healthStatus ?? 'Healthy'} className={inputClass}>
            {HEALTH.map((h) => (
              <option key={h} value={h}>
                {STATUS_LABEL[h]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {type === 'Dog' && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="pedigree" defaultChecked={editing?.pedigree ?? false} className="size-4 accent-primary" />
          Tiene pedigree
        </label>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : editing ? 'Actualizar' : 'Guardar'}
      </Button>
    </form>
  )
}

function Field({ label, name, type = 'text', defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input name={name} type={type} required maxLength={100} defaultValue={defaultValue} className={inputClass} />
    </label>
  )
}

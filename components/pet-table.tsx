'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { deletePet } from '@/app/actions'
import type { Pet } from '@/lib/pets'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'

export function PetTable({
  pets,
  onEdit,
  onMessage,
}: {
  pets: Pet[]
  onEdit: (pet: Pet) => void
  onMessage: (msg: { ok: boolean; message: string }) => void
}) {
  const [pending, startTransition] = useTransition()

  if (pets.length === 0) {
    return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No hay mascotas registradas.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Código</th>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Raza</th>
            <th className="px-4 py-3 font-medium">Año</th>
            <th className="px-4 py-3 font-medium">Color</th>
            <th className="px-4 py-3 font-medium">Salud</th>
            <th className="px-4 py-3 font-medium">Pedigree</th>
            <th className="px-4 py-3 text-right font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {pets.map((p, i) => (
            <tr key={`${p.type}-${p.subId}-${i}`} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3">{p.type === 'Dog' ? 'Perro' : 'Gato'}</td>
              <td className="px-4 py-3">{p.breed}</td>
              <td className="px-4 py-3 tabular-nums">{p.bornYear}</td>
              <td className="px-4 py-3">{p.color}</td>
              <td className="px-4 py-3">
                <StatusBadge status={p.healthStatus} />
              </td>
              <td className="px-4 py-3">{p.pedigree === null ? '—' : p.pedigree ? 'Sí' : 'No'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => onEdit(p)} aria-label={`Editar ${p.name}`}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={pending}
                    aria-label={`Eliminar ${p.name}`}
                    onClick={() => {
                      if (!confirm(`¿Eliminar a ${p.name} (${p.code})?`)) return
                      startTransition(async () => {
                        const res = await deletePet(p.petId, p.type)
                        if (res) onMessage(res)
                      })
                    }}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

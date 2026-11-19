import 'server-only'
import { createClient } from '@supabase/supabase-js'

export const HEALTH_STATUS = ['Sick', 'Healthy', 'In Surgery'] as const
export type PetType = 'Dog' | 'Cat'

export type Pet = {
  petId: number
  subId: number
  type: PetType
  code: string
  name: string
  bornYear: number
  color: string
  healthStatus: string
  breed: string
  pedigree: boolean | null
}

let client: ReturnType<typeof createClient> | null = null

export function db() {
  if (!client) {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Faltan variables de Supabase')
    client = createClient(url, key, { auth: { persistSession: false } })
  }
  return client
}

type PetRow = {
  id: number
  code: string
  name: string
  born_year: number
  color: string
  health_status: string
}

export async function listPets(type?: PetType): Promise<Pet[]> {
  const types: PetType[] = type ? [type] : ['Dog', 'Cat']
  const results = await Promise.all(
    types.map(async (t) => {
      const table = t === 'Dog' ? 'tb_dog' : 'tb_cat'
      const cols = t === 'Dog' ? 'id, breed, pedigree, id_pet' : 'id, breed, id_pet'
      const { data: subs, error } = await db().from(table).select(cols)
      if (error) throw new Error(error.message)
      const rows = (subs ?? []) as unknown as {
        id: number
        breed: string
        pedigree?: boolean
        id_pet: number
      }[]
      if (rows.length === 0) return []
      const { data: pets, error: petError } = await db()
        .from('tb_pet')
        .select('id, code, name, born_year, color, health_status')
        .in(
          'id',
          rows.map((r) => r.id_pet),
        )
      if (petError) throw new Error(petError.message)
      const byId = new Map(((pets ?? []) as PetRow[]).map((p) => [p.id, p]))
      return rows.flatMap((r) => {
        const p = byId.get(r.id_pet)
        if (!p) return []
        return [
          {
            petId: p.id,
            subId: r.id,
            type: t,
            code: p.code,
            name: p.name,
            bornYear: p.born_year,
            color: p.color,
            healthStatus: p.health_status,
            breed: r.breed,
            pedigree: t === 'Dog' ? Boolean(r.pedigree) : null,
          } satisfies Pet,
        ]
      })
    }),
  )
  return results.flat().sort((a, b) => a.code.localeCompare(b.code))
}

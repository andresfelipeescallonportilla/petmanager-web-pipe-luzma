'use server'

import { revalidatePath } from 'next/cache'
import { db, HEALTH_STATUS, type PetType } from '@/lib/pets'

export type ActionState = { ok: boolean; message: string } | null

function parse(form: FormData) {
  const type = form.get('type') === 'Cat' ? 'Cat' : ('Dog' as PetType)
  const code = String(form.get('code') ?? '').trim()
  const name = String(form.get('name') ?? '').trim()
  const color = String(form.get('color') ?? '').trim()
  const breed = String(form.get('breed') ?? '').trim()
  const healthStatus = String(form.get('healthStatus') ?? '')
  const bornYear = Number(form.get('bornYear'))
  const pedigree = form.get('pedigree') === 'on'
  const currentYear = new Date().getFullYear()

  if (!code || !name || !color || !breed) return { error: 'Todos los campos son obligatorios.' } as const
  if ([code, name, color, breed].some((v) => v.length > 100)) return { error: 'Algún campo es demasiado largo.' } as const
  if (!Number.isInteger(bornYear) || bornYear < 1950 || bornYear > currentYear)
    return { error: `El año de nacimiento debe estar entre 1950 y ${currentYear}.` } as const
  if (!(HEALTH_STATUS as readonly string[]).includes(healthStatus)) return { error: 'Estado de salud inválido.' } as const

  return {
    data: {
      type,
      pet: { code, name, born_year: bornYear, color, health_status: healthStatus },
      breed,
      pedigree,
    },
  } as const
}

export async function savePet(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = parse(form)
  if ('error' in parsed) return { ok: false, message: parsed.error! }
  const { type, pet, breed, pedigree } = parsed.data
  const petId = Number(form.get('petId')) || null
  const table = type === 'Dog' ? 'tb_dog' : 'tb_cat'
  const sub = type === 'Dog' ? { breed, pedigree } : { breed }

  const { data: dups } = await db().from('tb_pet').select('id').eq('code', pet.code)
  if (((dups ?? []) as { id: number }[]).some((d) => d.id !== petId)) return { ok: false, message: `Ya existe una mascota con el código ${pet.code}.` }

  if (petId) {
    const { error } = await db().from('tb_pet').update(pet as never).eq('id', petId)
    if (error) return { ok: false, message: error.message }
    const { error: subError } = await db().from(table).update(sub as never).eq('id_pet', petId)
    if (subError) return { ok: false, message: subError.message }
  } else {
    const { data, error } = await db().from('tb_pet').insert(pet as never).select('id').single()
    if (error) return { ok: false, message: error.message }
    const newId = (data as { id: number }).id
    const { error: subError } = await db()
      .from(table)
      .insert({ ...sub, id_pet: newId } as never)
    if (subError) {
      await db().from('tb_pet').delete().eq('id', newId)
      return { ok: false, message: subError.message }
    }
  }
  revalidatePath('/')
  return { ok: true, message: petId ? 'Mascota actualizada.' : 'Mascota creada.' }
}

export async function deletePet(petId: number, type: PetType): Promise<ActionState> {
  if (!Number.isInteger(petId) || petId <= 0) return { ok: false, message: 'ID inválido.' }
  const table = type === 'Dog' ? 'tb_dog' : 'tb_cat'
  await db().from('tb_pet_hospital').delete().eq('id_pet', petId)
  const { error: subError } = await db().from(table).delete().eq('id_pet', petId)
  if (subError) return { ok: false, message: subError.message }
  const { error } = await db().from('tb_pet').delete().eq('id', petId)
  if (error) return { ok: false, message: error.message }
  revalidatePath('/')
  return { ok: true, message: 'Mascota eliminada.' }
}

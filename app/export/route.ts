import { listPets, type PetType } from '@/lib/pets'

function cell(value: unknown) {
  let s = String(value ?? '')
  if (/^[=+\-@]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const param = new URL(request.url).searchParams.get('type')
  const type: PetType | undefined = param === 'Dog' || param === 'Cat' ? param : undefined
  const pets = await listPets(type)
  const header = ['Code', 'Name', 'Type', 'Born year', 'Color', 'Health status', 'Breed', 'Pedigree']
  const rows = pets.map((p) =>
    [p.code, p.name, p.type, p.bornYear, p.color, p.healthStatus, p.breed, p.pedigree === null ? '' : p.pedigree ? 'Yes' : 'No']
      .map(cell)
      .join(','),
  )
  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
  const name = `${(type ?? 'pet').toLowerCase()}_list_report_${stamp}.csv`
  return new Response('\uFEFF' + [header.map(cell).join(','), ...rows].join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
    },
  })
}

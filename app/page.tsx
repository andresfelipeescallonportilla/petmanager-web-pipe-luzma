import { Download, PawPrint } from 'lucide-react'
import { listPets } from '@/lib/pets'
import { PetManager } from '@/components/pet-manager'
import { HealthReport } from '@/components/health-report'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let pets: Awaited<ReturnType<typeof listPets>> = []
  let loadError: string | null = null
  try {
    pets = await listPets()
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Error desconocido'
  }

  const exports = [
    { href: '/export', label: 'Todas' },
    { href: '/export?type=Dog', label: 'Perros' },
    { href: '/export?type=Cat', label: 'Gatos' },
  ]

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Pet Manager</h1>
            <p className="text-sm text-muted-foreground">Gestión de perros y gatos conectada a Supabase</p>
          </div>
        </div>
        <nav aria-label="Exportar" className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Exportar CSV:</span>
          {exports.map((e) => (
            <a key={e.href} href={e.href} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-medium hover:bg-muted">
              <Download className="size-3.5" aria-hidden />
              {e.label}
            </a>
          ))}
        </nav>
      </header>

      {loadError ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          No se pudo conectar con la base de datos: {loadError}
        </p>
      ) : (
        <>
          <section aria-label="Reportes por estado de salud" className="grid gap-4 md:grid-cols-3">
            <HealthReport title="Todas las mascotas" pets={pets} />
            <HealthReport title="Perros" pets={pets.filter((p) => p.type === 'Dog')} />
            <HealthReport title="Gatos" pets={pets.filter((p) => p.type === 'Cat')} />
          </section>
          <PetManager pets={pets} />
        </>
      )}
    </main>
  )
}

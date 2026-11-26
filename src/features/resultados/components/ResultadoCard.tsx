import { CAMPOS_PUNTAJE, VALORES, type Resultado } from '../types'

interface ResultadoCardProps {
  resultado: Resultado
}

/** Componente de presentación: recibe un resultado por props y solo lo muestra. */
export function ResultadoCard({ resultado }: ResultadoCardProps) {
  const fecha = new Date(resultado.fechaAplicacion).toLocaleDateString('es-NI')

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{resultado.nombreEstudiante}</h3>
          <p className="text-sm text-slate-600">
            {resultado.carrera} · Carnet {resultado.carnet}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
          {VALORES[resultado.valorDominante] ?? resultado.valorDominante}
        </span>
      </header>

      <dl className="grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
        {CAMPOS_PUNTAJE.map(({ campo, etiqueta }) => (
          <div key={campo} className="flex justify-between">
            <dt className="text-slate-500">{etiqueta}</dt>
            <dd className="font-medium text-slate-800">{resultado[campo]}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-xs text-slate-400">Aplicado el {fecha}</p>
    </article>
  )
}

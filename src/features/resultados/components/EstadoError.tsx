import type { ApiError } from '../../../shared/api/httpClient'

interface EstadoErrorProps {
  error: ApiError
  onReintentar: () => void
}

/** Error controlado del GET con botón Reintentar. role="alert" lo anuncia a lectores de pantalla. */
export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <div>
        <p className="font-semibold text-red-800">No se pudieron cargar los resultados</p>
        <p className="text-sm text-red-700">
          {error.message}
          {error.status > 0 && ` · HTTP ${error.status}`}
        </p>
      </div>
      <button type="button" onClick={onReintentar} className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white">
        Reintentar
      </button>
    </div>
  )
}

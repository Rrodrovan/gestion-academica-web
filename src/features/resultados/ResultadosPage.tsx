import { useMemo, useState } from 'react'
import { filtrarResultados } from './calculos'
import { EstadoError } from './components/EstadoError'
import { Filtros, type FiltrosValor } from './components/Filtros'
import { Indicadores } from './components/Indicadores'
import { ResultadoCard } from './components/ResultadoCard'
import { ResultadoForm } from './components/ResultadoForm'
import { useResultados } from './useResultados'

const SIN_FILTROS: FiltrosValor = { carrera: '', valor: '', texto: '' }

export function ResultadosPage() {
  const { resultados, cargando, error, reintentar, agregar } = useResultados()
  const [filtros, setFiltros] = useState<FiltrosValor>(SIN_FILTROS)

  // Datos derivados: no se guardan en estado, se recalculan desde la lista y los filtros.
  const carreras = useMemo(
    () => [...new Set(resultados.map((r) => r.carrera))].sort((a, b) => a.localeCompare(b, 'es')),
    [resultados],
  )
  const visibles = useMemo(() => filtrarResultados(resultados, filtros), [resultados, filtros])

  return (
    <div className="space-y-6">
      <ResultadoForm onRegistrado={agregar} />

      {cargando && (
        <p role="status" aria-live="polite" className="flex items-center gap-2 text-slate-600">
          <span className="size-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" aria-hidden="true" />
          Cargando resultados…
        </p>
      )}

      {!cargando && error && <EstadoError error={error} onReintentar={reintentar} />}

      {!cargando && !error && (
        <>
          <Indicadores resultados={resultados} />
          <Filtros filtros={filtros} carreras={carreras} onChange={setFiltros} />

          <p className="text-sm text-slate-600" aria-live="polite">
            Mostrando {visibles.length} de {resultados.length} resultados
          </p>

          {visibles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
              {resultados.length === 0
                ? 'La API no devolvió resultados todavía.'
                : 'Ningún resultado coincide con los filtros seleccionados.'}
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibles.map((r) => (
                <li key={r.id}>
                  <ResultadoCard resultado={r} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

import { CODIGOS_VALOR, VALORES, type CodigoValor } from '../types'

export interface FiltrosValor {
  carrera: string
  valor: CodigoValor | ''
  texto: string
}

interface FiltrosProps {
  filtros: FiltrosValor
  carreras: string[]
  onChange: (filtros: FiltrosValor) => void
}

/** Componente controlado: el estado vive en App y llega por props. */
export function Filtros({ filtros, carreras, onChange }: FiltrosProps) {
  const hayFiltros = filtros.carrera !== '' || filtros.valor !== '' || filtros.texto !== ''

  return (
    <section aria-label="Filtros" className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
      <label className="flex min-w-56 flex-1 flex-col text-sm text-slate-700">
        Buscar por nombre o carnet
        <div className="mt-1 flex gap-2">
          <input
            type="search"
            value={filtros.texto}
            onChange={(e) => onChange({ ...filtros, texto: e.target.value })}
            placeholder="Ej. ana, 20230004"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={() => onChange({ ...filtros, texto: '' })}
            disabled={filtros.texto === ''}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 disabled:opacity-40"
          >
            Limpiar
          </button>
        </div>
      </label>

      <label className="flex flex-col text-sm text-slate-700">
        Carrera
        <select
          value={filtros.carrera}
          onChange={(e) => onChange({ ...filtros, carrera: e.target.value })}
          className="mt-1 rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Todas</option>
          {carreras.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-slate-700">
        Valor dominante
        <select
          value={filtros.valor}
          onChange={(e) => onChange({ ...filtros, valor: e.target.value as CodigoValor | '' })}
          className="mt-1 rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Todos</option>
          {CODIGOS_VALOR.map((codigo) => (
            <option key={codigo} value={codigo}>
              {VALORES[codigo]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => onChange({ carrera: '', valor: '', texto: '' })}
        disabled={!hayFiltros}
        className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
      >
        Quitar filtros
      </button>
    </section>
  )
}

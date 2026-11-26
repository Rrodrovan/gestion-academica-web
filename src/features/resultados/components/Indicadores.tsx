import { porcentaje } from '../calculos'
import { CODIGOS_VALOR, VALORES, type Resultado } from '../types'

interface IndicadoresProps {
  resultados: Resultado[]
}

/** Indicadores derivados: se calculan en cada render a partir de la lista, sin estado propio. */
export function Indicadores({ resultados }: IndicadoresProps) {
  const total = resultados.length
  const conteo = CODIGOS_VALOR.map((codigo) => ({
    codigo,
    cantidad: resultados.filter((r) => r.valorDominante === codigo).length,
  }))
  const carreras = new Set(resultados.map((r) => r.carrera)).size

  if (total === 0) {
    return (
      <section aria-label="Indicadores" className="rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">
        Aún no hay resultados para calcular indicadores. Registra el primero con el formulario.
      </section>
    )
  }

  return (
    <section aria-label="Indicadores" className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
      <Tarjeta titulo="Total" valor={String(total)} detalle="resultados" destacado />
      <Tarjeta titulo="Carreras" valor={String(carreras)} detalle="distintas" destacado />
      {conteo.map(({ codigo, cantidad }) => (
        <Tarjeta
          key={codigo}
          titulo={VALORES[codigo]}
          valor={String(cantidad)}
          detalle={`${porcentaje(cantidad, total)} % del total`}
        />
      ))}
    </section>
  )
}

function Tarjeta({ titulo, valor, detalle, destacado = false }: { titulo: string; valor: string; detalle: string; destacado?: boolean }) {
  return (
    <div className={`rounded-xl p-3 shadow-sm ${destacado ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800'}`}>
      <p className={`text-xs ${destacado ? 'text-indigo-100' : 'text-slate-500'}`}>{titulo}</p>
      <p className="text-2xl font-bold">{valor}</p>
      <p className={`text-xs ${destacado ? 'text-indigo-100' : 'text-slate-500'}`}>{detalle}</p>
    </div>
  )
}

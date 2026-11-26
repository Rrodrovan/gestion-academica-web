import type { FiltrosValor } from './components/Filtros'
import type { Resultado } from './types'

/** Porcentaje seguro: nunca divide entre cero. */
export function porcentaje(parte: number, total: number): number {
  return total === 0 ? 0 : Math.round((parte / total) * 100)
}

/** Minúsculas y sin tildes, para comparar "José" con "jose". */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/**
 * Filtro combinado (carrera + valor dominante + texto). Es un dato derivado:
 * se calcula a partir de la lista y de los filtros, no se guarda como estado.
 */
export function filtrarResultados(resultados: Resultado[], filtros: FiltrosValor): Resultado[] {
  const texto = normalizar(filtros.texto)
  return resultados.filter((r) => {
    const coincideCarrera = filtros.carrera === '' || r.carrera === filtros.carrera
    const coincideValor = filtros.valor === '' || r.valorDominante === filtros.valor
    const coincideTexto =
      texto === '' || normalizar(r.nombreEstudiante).includes(texto) || r.carnet.includes(texto)
    return coincideCarrera && coincideValor && coincideTexto
  })
}

import { api } from '../../shared/api/httpClient'
import type { Pagina, Resultado, ResultadoNuevo } from './types'

/** El backend no entrega más de 50 registros por página. */
const TAMANO_PAGINA = 50

/**
 * Trae todos los resultados recorriendo las páginas de la API.
 * El signal permite cancelar la consulta si el componente se desmonta.
 */
export async function listarResultados(signal?: AbortSignal): Promise<Resultado[]> {
  const todos: Resultado[] = []
  let page = 0
  let last = false

  while (!last) {
    const { data } = await api.get<Pagina<Resultado>>('/resultados', {
      params: { page, size: TAMANO_PAGINA, sort: 'id,asc' },
      signal,
    })
    todos.push(...data.content)
    last = data.last || data.content.length === 0
    page += 1
  }

  return todos
}

/** Registra un resultado. Devuelve lo que confirma el servidor (201 Created). */
export async function registrarResultado(nuevo: ResultadoNuevo): Promise<Resultado> {
  const { data } = await api.post<Resultado>('/resultados', nuevo)
  return data
}

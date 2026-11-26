import { useCallback, useEffect, useState } from 'react'
import { ApiError, isCancelled, toApiError } from '../../shared/api/httpClient'
import { listarResultados } from './resultadosApi'
import type { Resultado } from './types'

/**
 * Consulta GET /resultados con useEffect: es un efecto secundario (sale del
 * componente hacia la red), no un cálculo del render.
 */
export function useResultados() {
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    listarResultados(controller.signal)
      .then((datos) => {
        setResultados(datos)
        setError(null)
      })
      .catch((err: unknown) => {
        if (isCancelled(err)) return // el componente se desmontó o se reintentó
        setError(toApiError(err))
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false)
      })

    // Limpieza: cancela la petición en curso para no actualizar estado obsoleto.
    return () => controller.abort()
  }, [intento])

  const reintentar = useCallback(() => {
    setCargando(true)
    setError(null)
    setIntento((n) => n + 1)
  }, [])

  /** Agrega a la lista un registro ya confirmado por el servidor (sin mutar el arreglo). */
  const agregar = useCallback((nuevo: Resultado) => {
    setResultados((actuales) => [...actuales, nuevo])
  }, [])

  return { resultados, cargando, error, reintentar, agregar }
}

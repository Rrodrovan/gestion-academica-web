import axios, { AxiosError } from 'axios'
import { env } from '../config/env'
import type { ApiErrorBody } from './types'

/**
 * Error normalizado que reciben los componentes.
 * status = 0 significa que no hubo respuesta HTTP (servidor caído,
 * tiempo de espera agotado o bloqueo de red/CORS).
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/**
 * Instancia única de Axios: URL base, tiempo máximo y cabeceras comunes.
 * En desarrollo la URL base es /api/v1 y el proxy de Vite la reenvía a
 * Spring Boot (http://localhost:9090), por eso el navegador no aplica CORS.
 */
export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 8000,
  headers: { Accept: 'application/json' },
})

/** true cuando la petición se canceló a propósito (AbortController). */
export function isCancelled(error: unknown): boolean {
  return axios.isCancel(error)
}

function defaultMessage(status: number): string {
  if (status === 400) return 'Los datos enviados no son válidos'
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente'
  if (status === 403) return 'No tienes permiso para realizar esta operación'
  if (status === 404) return 'El recurso solicitado no existe (404). Revisa la URL del endpoint'
  if (status === 409) return 'El registro ya existe'
  return 'Ocurrió un error inesperado'
}

/** Convierte cualquier error de Axios en un ApiError con un mensaje claro. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (!(error instanceof AxiosError)) {
    return new ApiError('Ocurrió un error inesperado', 0)
  }

  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    return new ApiError('El servidor tardó demasiado en responder (más de 8 s)', 0)
  }

  const response = error.response
  if (!response) {
    // Sin respuesta: servidor apagado, red caída o petición bloqueada por CORS.
    return new ApiError(
      'No se pudo conectar con el servidor. Verifica que la API de Spring Boot esté en ejecución',
      0,
    )
  }

  const body = response.data as ApiErrorBody | string | null
  const hasJsonBody = typeof body === 'object' && body !== null

  if (response.status >= 500 && !hasJsonBody) {
    // El proxy de Vite responde 5xx sin JSON cuando Spring Boot no está levantado.
    return new ApiError(
      'El servidor no está disponible. ¿Spring Boot está detenido?',
      response.status,
    )
  }

  const errorBody = hasJsonBody ? body : null
  return new ApiError(
    errorBody?.message ?? defaultMessage(response.status),
    response.status,
    errorBody?.errores,
  )
}

// Todas las respuestas con error llegan a los componentes ya convertidas en ApiError,
// salvo las cancelaciones, que se dejan pasar para poder ignorarlas.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(isCancelled(error) ? error : toApiError(error)),
)

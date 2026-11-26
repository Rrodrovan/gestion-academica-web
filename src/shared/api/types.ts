/**
 * Formato de error que devuelve el backend (GlobalExceptionHandler de
 * gestion-academica-allport). `errores` solo viene en los 400 de validación.
 */
export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message?: string
  path?: string
  errores?: Record<string, string>
}

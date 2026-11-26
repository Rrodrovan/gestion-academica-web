/** Códigos de valor que calcula el backend como valor dominante. */
export type CodigoValor = 'TEO' | 'ECO' | 'EST' | 'SOC' | 'POL' | 'REL'

export const VALORES: Record<CodigoValor, string> = {
  TEO: 'Teórico',
  ECO: 'Económico',
  EST: 'Estético',
  SOC: 'Social',
  POL: 'Político',
  REL: 'Religioso',
}

export const CODIGOS_VALOR = Object.keys(VALORES) as CodigoValor[]

/** Respuesta de GET /api/v1/resultados (ResultadoTestResponse). */
export interface Resultado {
  id: number
  carnet: string
  nombreEstudiante: string
  carrera: string
  teorico: number
  economico: number
  estetico: number
  social: number
  politico: number
  religioso: number
  valorDominante: CodigoValor
  fechaAplicacion: string
}

/** Cuerpo de POST /api/v1/resultados (ResultadoTestRequest). */
export type ResultadoNuevo = Omit<Resultado, 'id' | 'valorDominante' | 'fechaAplicacion'>

export type CampoPuntaje = 'teorico' | 'economico' | 'estetico' | 'social' | 'politico' | 'religioso'

export const CAMPOS_PUNTAJE: { campo: CampoPuntaje; etiqueta: string }[] = [
  { campo: 'teorico', etiqueta: 'Teórico' },
  { campo: 'economico', etiqueta: 'Económico' },
  { campo: 'estetico', etiqueta: 'Estético' },
  { campo: 'social', etiqueta: 'Social' },
  { campo: 'politico', etiqueta: 'Político' },
  { campo: 'religioso', etiqueta: 'Religioso' },
]

/** PaginaResponse del backend. */
export interface Pagina<T> {
  content: T[]
  number: number
  size: number
  numberOfElements: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

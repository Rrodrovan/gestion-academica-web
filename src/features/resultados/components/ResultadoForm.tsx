import { useState, type FormEvent } from 'react'
import type { ApiError } from '../../../shared/api/httpClient'
import { registrarResultado } from '../resultadosApi'
import { CAMPOS_PUNTAJE, type CampoPuntaje, type Resultado, type ResultadoNuevo } from '../types'

type Formulario = Record<'carnet' | 'nombreEstudiante' | 'carrera' | CampoPuntaje, string>

const VACIO: Formulario = {
  carnet: '',
  nombreEstudiante: '',
  carrera: '',
  teorico: '40',
  economico: '40',
  estetico: '40',
  social: '40',
  politico: '40',
  religioso: '40',
}

const SUMA_TOTAL = 240

interface ResultadoFormProps {
  /** Se llama solo cuando el servidor confirmó el registro (201). */
  onRegistrado: (resultado: Resultado) => void
}

/** Validación en el cliente: misma regla que el DTO de Spring Boot, para avisar antes de enviar. */
function validar(f: Formulario): Record<string, string> {
  const errores: Record<string, string> = {}
  if (!/^[0-9]{5,20}$/.test(f.carnet.trim())) errores.carnet = 'El carnet debe tener solo dígitos (entre 5 y 20)'
  const nombre = f.nombreEstudiante.trim()
  if (nombre.length < 3 || nombre.length > 100) errores.nombreEstudiante = 'El nombre debe tener entre 3 y 100 caracteres'
  const carrera = f.carrera.trim()
  if (carrera.length < 3 || carrera.length > 80) errores.carrera = 'La carrera debe tener entre 3 y 80 caracteres'
  for (const { campo, etiqueta } of CAMPOS_PUNTAJE) {
    const n = Number(f[campo])
    if (f[campo] === '' || !Number.isInteger(n) || n < 0 || n > 80) errores[campo] = `${etiqueta}: entero entre 0 y 80`
  }
  if (Object.keys(errores).length === 0 && sumar(f) !== SUMA_TOTAL) {
    errores.suma = `La suma de los seis puntajes debe ser ${SUMA_TOTAL}`
  }
  return errores
}

function sumar(f: Formulario): number {
  return CAMPOS_PUNTAJE.reduce((acc, { campo }) => acc + (Number(f[campo]) || 0), 0)
}

export function ResultadoForm({ onRegistrado }: ResultadoFormProps) {
  const [form, setForm] = useState<Formulario>(VACIO)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const suma = sumar(form)

  function cambiar(campo: keyof Formulario, valor: string) {
    setForm((actual) => ({ ...actual, [campo]: valor }))
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (enviando) return // evita doble envío

    const encontrados = validar(form)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) {
      setMensaje({ tipo: 'error', texto: 'Revisa los campos marcados antes de enviar.' })
      return
    }

    const cuerpo: ResultadoNuevo = {
      carnet: form.carnet.trim(),
      nombreEstudiante: form.nombreEstudiante.trim(),
      carrera: form.carrera.trim(),
      teorico: Number(form.teorico),
      economico: Number(form.economico),
      estetico: Number(form.estetico),
      social: Number(form.social),
      politico: Number(form.politico),
      religioso: Number(form.religioso),
    }

    setEnviando(true)
    setMensaje(null)
    try {
      const creado = await registrarResultado(cuerpo)
      onRegistrado(creado) // la lista se actualiza solo con lo que confirmó el servidor
      setForm(VACIO)
      setErrores({})
      setMensaje({ tipo: 'ok', texto: `Resultado de ${creado.nombreEstudiante} registrado (id ${creado.id}).` })
    } catch (err) {
      const apiError = err as ApiError
      setErrores(apiError.fieldErrors ?? {})
      setMensaje({ tipo: 'error', texto: `${apiError.message}${apiError.status ? ` (HTTP ${apiError.status})` : ''}` })
    } finally {
      setEnviando(false)
    }
  }

  const campoTexto = (campo: 'carnet' | 'nombreEstudiante' | 'carrera', etiqueta: string, placeholder: string) => (
    <label className="flex flex-col text-sm text-slate-700">
      {etiqueta}
      <input
        value={form[campo]}
        onChange={(e) => cambiar(campo, e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(errores[campo])}
        aria-describedby={errores[campo] ? `error-${campo}` : undefined}
        className="mt-1 rounded-lg border border-slate-300 px-3 py-2 aria-invalid:border-red-500"
      />
      {errores[campo] && (
        <span id={`error-${campo}`} className="mt-1 text-xs text-red-600">
          {errores[campo]}
        </span>
      )}
    </label>
  )

  return (
    <form onSubmit={enviar} noValidate className="space-y-4 rounded-xl bg-white p-4 shadow-sm" aria-label="Registrar resultado">
      <h2 className="text-lg font-semibold text-slate-900">Registrar resultado (POST)</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        {campoTexto('carnet', 'Carnet', '20230013')}
        {campoTexto('nombreEstudiante', 'Nombre del estudiante', 'Nombre Apellido')}
        {campoTexto('carrera', 'Carrera', 'Ingeniería en Sistemas')}
      </div>

      <fieldset>
        <legend className="text-sm text-slate-700">Puntajes (0 a 80, deben sumar {SUMA_TOTAL})</legend>
        <div className="mt-1 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {CAMPOS_PUNTAJE.map(({ campo, etiqueta }) => (
            <label key={campo} className="flex flex-col text-xs text-slate-600">
              {etiqueta}
              <input
                type="number"
                min={0}
                max={80}
                value={form[campo]}
                onChange={(e) => cambiar(campo, e.target.value)}
                aria-invalid={Boolean(errores[campo])}
                className="mt-1 rounded-lg border border-slate-300 px-2 py-1 aria-invalid:border-red-500"
              />
            </label>
          ))}
        </div>
        <p className={`mt-2 text-sm ${suma === SUMA_TOTAL ? 'text-emerald-700' : 'text-amber-700'}`}>
          Suma actual: {suma} / {SUMA_TOTAL}
        </p>
        {Object.entries(errores)
          .filter(([campo]) => !['carnet', 'nombreEstudiante', 'carrera'].includes(campo))
          .map(([campo, texto]) => (
            <p key={campo} className="text-xs text-red-600">
              {texto}
            </p>
          ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Enviando…' : 'Registrar'}
        </button>
        {mensaje && (
          <p role={mensaje.tipo === 'error' ? 'alert' : 'status'} className={`text-sm ${mensaje.tipo === 'ok' ? 'text-emerald-700' : 'text-red-700'}`}>
            {mensaje.texto}
          </p>
        )}
      </div>
    </form>
  )
}

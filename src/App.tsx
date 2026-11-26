import { ResultadosPage } from './features/resultados/ResultadosPage'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-indigo-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <p className="text-sm text-indigo-200">Gestión Académica · Servicios Web</p>
          <h1 className="text-2xl font-bold">Test de Valores de Allport</h1>
          <p className="text-sm text-indigo-100">React + Axios consumiendo la API de Spring Boot (/api/v1/resultados)</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <ResultadosPage />
      </main>
    </div>
  )
}

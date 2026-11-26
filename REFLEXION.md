# Reflexión — Clase práctica React (Semana 10)

**Estudiante:** Rodrigo Iván Ramírez Dávalos · **Asignatura:** Servicios Web (SIS0421, grupo 2)
**Proyecto:** gestion-academica-web, frontend del Test de Valores de Allport

## 1. ¿Qué diferencia hay entre componente, prop y estado?

- **Componente:** es una función que devuelve la interfaz de una parte de la pantalla. En el proyecto son `ResultadoCard`, `Filtros`, `Indicadores`, `ResultadoForm` y `EstadoError`.
- **Prop:** es un dato que el componente padre le entrega al hijo. El hijo la recibe y no la modifica. Por ejemplo, `ResultadoCard` recibe `resultado` y solo lo muestra. `Filtros` recibe `filtros` y una función `onChange`, y avisa al padre cuando hay un cambio.
- **Estado (`useState`):** es un dato que el componente guarda y que puede cambiar con el tiempo. Cada cambio de estado vuelve a dibujar la vista. En el proyecto son la lista que llega de la API, `cargando`, `error`, los filtros y los campos del formulario.

La regla es la siguiente: si un dato se puede **calcular** a partir de otro, no se guarda como estado. Por eso la lista filtrada, las carreras disponibles y los indicadores se derivan con `useMemo` o con un cálculo directo en el render.

## 2. ¿Por qué `useEffect` es adecuado para consultar una API externa?

Consultar la API es un **efecto secundario**: sale del componente hacia la red y su resultado llega después, de forma asíncrona. El render debe ser una función pura, así que no puede hacer la petición. Si la hiciera, cada render dispararía otra petición, y como la respuesta cambia el estado se formaría un ciclo infinito.

`useEffect` corre **después** de pintar y solo cuando cambian sus dependencias (`[intento]`). Además permite devolver una función de **limpieza**. Ahí se usa `AbortController.abort()` para cancelar la petición cuando el componente se desmonta o cuando se pulsa *Reintentar*, y así una respuesta vieja no sobrescribe el estado. En modo `StrictMode` React monta el efecto dos veces en desarrollo, y la cancelación evita que la primera respuesta se procese.

## 3. ¿Qué responsabilidades corresponden a React y cuáles a Spring Boot?

| React (cliente) | Spring Boot (servidor) |
|---|---|
| Mostrar datos, estados de carga, vacío y error | Exponer el contrato REST (`/api/v1/resultados`) |
| Filtrar, buscar y calcular indicadores para la vista | Persistir en PostgreSQL y paginar (`Pageable`) |
| Validar el formulario **para orientar al usuario** antes de enviar | Validar **de verdad** con `@Valid` (carnet, rangos 0–80, suma = 240), porque el cliente se puede saltar |
| Evitar envíos duplicados (botón deshabilitado) | Garantizar la unicidad del carnet (409 Conflict) |
| Traducir errores HTTP a mensajes claros | Calcular `valorDominante` y `fechaAplicacion`, y devolver códigos HTTP correctos |

La lógica de negocio y la integridad de los datos viven en el backend. React es una capa de presentación que nunca debe ser la única barrera.

## 4. ¿Cómo distinguir un error de CORS, un 404 y un servidor detenido?

- **CORS:** Spring Boot sí responde, pero el navegador **bloquea** la respuesta porque falta `Access-Control-Allow-Origin` para `http://localhost:5173`. Axios recibe un *Network Error* sin `response` (status 0). La consola del navegador muestra el mensaje *“blocked by CORS policy”* y Postman sí funciona, porque Postman no aplica CORS. En este proyecto no ocurre porque se usa el proxy de Vite, y además el backend permite ese origen.
- **404:** sí hay respuesta HTTP, con `status = 404`. El servidor está vivo, pero la ruta o el id no existen, por ejemplo `/api/v1/resultado` sin la *s*. En la pestaña *Network* se ve la petición con 404, y el cliente muestra “El recurso solicitado no existe (404)”.
- **Servidor detenido:** no hay nadie escuchando en el puerto 9090. Sin proxy, Axios da *Network Error* (`ERR_CONNECTION_REFUSED`). Con el proxy de Vite llega un **502** sin cuerpo JSON y la terminal de Vite muestra `http proxy error … ECONNREFUSED`. El cliente lo traduce como “El servidor no está disponible. ¿Spring Boot está detenido?” y ofrece *Reintentar*. Si el servidor no contesta dentro de 8 s, se agota el `timeout` y aparece un mensaje distinto.

Para diagnosticar se revisan tres cosas: la pestaña *Network* (¿hay código HTTP?), la consola (¿dice CORS?) y Postman (¿la API responde fuera del navegador?).

## 5. ¿Qué mejoras harías antes de publicar a usuarios reales?

1. **Autenticación y autorización** con JWT, como en la práctica 9: solo personal autorizado registra resultados, y los resultados son datos sensibles de estudiantes.
2. **HTTPS** y CORS restringido al dominio real, nunca `*`. Las URLs se configuran con variables de entorno de producción.
3. **Paginación y filtros en el servidor** (`?carrera=&valor=&q=`) en lugar de descargar todo. Ver el reto 3.
4. Una **librería de caché** de consultas, como TanStack Query (ya está en la base), para reintentos, caché e invalidación tras el POST.
5. **Pruebas** unitarias de `calculos.ts`, pruebas de componentes y pruebas de extremo a extremo. También monitoreo de errores en el frontend.
6. Accesibilidad revisada con lector de pantalla, mensajes con `aria-live` y contraste AA.
7. Edición y anulación de registros con auditoría, y protección contra envíos repetidos también en el servidor (idempotencia).

---

## Decisiones por reto

### Reto 1 · Filtro combinado
El filtro por **carrera** reemplaza a “prioridad” y el filtro por **valor dominante** reemplaza a “estado”. `filtrarResultados()` aplica los dos al mismo tiempo, y también la búsqueda de texto. La lista filtrada **no se guarda en estado**: se deriva con `useMemo` a partir de `resultados` y `filtros`. Guardarla duplicaría la información y podría desincronizarse, por ejemplo después de un POST.

Caso sin coincidencias: con la carrera *Teología* y el valor *Social* aparece “Ningún resultado coincide con los filtros seleccionados”. Es un mensaje distinto del de API vacía.

### Reto 2 · Indicadores operativos
Se muestran el total de resultados, las carreras distintas y, para cada uno de los seis valores, la cantidad y su porcentaje sobre el total. `porcentaje(parte, total)` devuelve 0 cuando `total === 0`, así que nunca divide entre cero. Si la API devuelve un arreglo vacío, no se muestran tarjetas en 0: aparece un mensaje que invita a registrar el primer resultado. Los indicadores se calculan sobre **toda** la lista, no sobre la filtrada, para que no cambien al buscar.

### Reto 3 · Búsqueda robusta
La búsqueda compara por nombre o carnet y usa `normalizar()`: minúsculas y sin tildes con `normalize('NFD')`. Así *“JOSE”* encuentra a *José Ruiz*. El botón **Limpiar** vacía la búsqueda y **Quitar filtros** reinicia todo.

**Con 10 000 solicitudes:** descargar todo y filtrar en el navegador sería lento, tanto por la red (200 páginas de 50) como por el render de miles de tarjetas. Habría que:
- mover filtro y búsqueda al backend (parámetros de consulta, índices en PostgreSQL, `LIKE`/`ILIKE` o búsqueda de texto completo);
- usar paginación real en la UI o *scroll* infinito;
- aplicar *debounce* de unos 300 ms al texto y cancelar la petición anterior con `AbortController`;
- usar virtualización de la lista.

### Reto 4 · Registro real mediante POST
El backend ya tiene `POST /api/v1/resultados` con un DTO validado y persistencia en PostgreSQL. En React, `ResultadoForm`:
- **valida** las mismas reglas del DTO antes de enviar (carnet de 5–20 dígitos, nombre y carrera con longitud mínima, puntajes enteros 0–80, suma 240 mostrada en vivo);
- **evita duplicados**: el botón queda deshabilitado y muestra *Enviando…* mientras hay una petición en curso, y además el envío se ignora si `enviando` ya es `true`;
- **actualiza la lista solo con la respuesta 201** del servidor (`onRegistrado(creado)`), con el `id` y el `valorDominante` calculados por el backend. No hay actualización optimista.

Códigos HTTP:
- **201 Created** con `Location` al registrar.
- **400 Bad Request** con `errores` por campo, que se muestran junto al campo.
- **409 Conflict** si el carnet ya existe, con el mensaje del servidor.
- Error de red o 5xx con un mensaje de servidor no disponible.

### Reto 5 · Diseño y resiliencia
- Componentes pequeños, un módulo de servicios (`resultadosApi.ts`) y un cliente HTTP compartido (`httpClient.ts`) con un interceptor que convierte cualquier error en `ApiError`.
- Indicador de carga con `role="status"` y `aria-live="polite"`. Los errores usan `role="alert"`, y los campos inválidos `aria-invalid` y `aria-describedby`.
- Botón **Reintentar** cuando falla el GET: vuelve a ejecutar el efecto incrementando `intento`.
- **Información desactualizada al cambiar filtros rápido:** aquí los filtros son locales (derivados), así que no hay carreras entre respuestas. Si los filtros consultaran al servidor, cada cambio cancelaría la petición anterior con `AbortController` en la limpieza del `useEffect`, y se ignorarían las respuestas abortadas. Opcionalmente se aplicaría *debounce* al texto, y TanStack Query manejaría esto con claves por filtro.

# Cine en las plazas

Aplicación web académica para administrar funciones de cine al aire libre, guardar datos en Supabase y mostrar la ubicación seleccionada en Google Maps.

## Tecnologías

- HTML, CSS y JavaScript.
- Supabase (PostgreSQL) como base de datos.
- Google Maps mediante mapa incrustado por coordenadas.
- GitHub para alojar el código.
- Render Static Site para publicar la web.

## Archivos

- `index.html`: estructura de la aplicación.
- `styles.css`: diseño adaptable a celular y computadora.
- `app.js`: operaciones CRUD, filtros, validaciones y mapa.
- `supabase.sql`: tabla, restricciones, políticas y ejemplos.

## Configuración de Supabase

1. Crear un proyecto en https://supabase.com/.
2. Abrir SQL Editor, crear una consulta y ejecutar el contenido de `supabase.sql`.
3. En Project Settings → API (o API Keys), copiar Project URL y la clave `anon`/`public`.
4. Pegar esos valores en `SUPABASE_URL` y `SUPABASE_ANON_KEY` al comienzo de `app.js`.
5. No pegar nunca la clave `service_role` en el código del navegador.

> Para esta demostración académica las políticas permiten operaciones públicas anónimas. No usar esta configuración abierta para datos privados o una aplicación real con usuarios.

## Publicar en Render

1. Subir todos estos archivos a un repositorio de GitHub.
2. En Render, elegir **New → Static Site** y conectar el repositorio.
3. Build Command: dejar vacío.
4. Publish Directory: `.` (un punto).
5. Crear el sitio. Cada actualización enviada a GitHub podrá desplegarse automáticamente.

## Pruebas solicitadas por el examen

Marcar cada prueba después de realizarla en el sitio publicado:

- [ ] Crear y listar una función con todos sus campos.
- [ ] Editar una función y comprobar el cambio después de recargar.
- [ ] Eliminar una función.
- [ ] Filtrar por Comedia.
- [ ] Filtrar por Aventura.
- [ ] Seleccionar dos registros y comparar sus marcadores en Google Maps.
- [ ] Cambiar las coordenadas de una función de Aventura, guardar, recargar y comprobar que la misma película aparece en la nueva ubicación.
- [ ] Intentar guardar latitud `95` y comprobar que la aplicación la rechaza.
- [ ] Intentar coordenadas vacías o no numéricas y comprobar que no se guardan.

### Explicación de la latitud 95

Se rechaza porque la latitud válida en grados decimales debe estar entre -90 y 90. El valor 95 supera el máximo permitido. La aplicación lo valida antes de enviar los datos y la tabla también tiene una restricción `CHECK` en Supabase.

## Consulta a Gemini solicitada en el examen

El examen pide incluir una consulta propia hecha a Gemini en Google AI Studio, indicar qué sugerencia se aplicó o corrigió y explicar con qué prueba se verificó el resultado. Esta sección debe completarse después de realizar realmente esa consulta. No afirmar que se hizo una consulta o una prueba que todavía no se realizó.

**Consulta para realizar y documentar:**

> Revisá la validación de coordenadas GPS de esta aplicación web. La latitud debe aceptar solamente números decimales entre -90 y 90 y la longitud entre -180 y 180. Indicá casos de prueba para valores vacíos, texto, límites válidos y valores fuera de rango. No cambies el resto de las funciones CRUD.

**Sugerencia recibida de Gemini:** [Completar con la sugerencia real recibida.]

**Sugerencia aplicada o corregida:** [Describir qué se modificó realmente en el código.]

**Prueba realizada y resultado:** [Indicar qué valores se probaron y qué ocurrió.]

## Enlaces de entrega

- Sitio publicado en Render: [PEGAR URL DE RENDER]
- Repositorio GitHub: [PEGAR URL DE GITHUB]

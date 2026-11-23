// 1) Pegá aquí la URL y la clave anon/public de tu proyecto Supabase.
// Nunca coloques la service_role key en este archivo.
const SUPABASE_URL = "PEGAR_AQUI_URL_DE_SUPABASE";
const SUPABASE_ANON_KEY = "PEGAR_AQUI_CLAVE_ANON_PUBLICA";

const configured = SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("PEGAR_AQUI") &&
  !SUPABASE_ANON_KEY.includes("PEGAR_AQUI") &&
  SUPABASE_ANON_KEY.length > 20;

const client = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const $ = (id) => document.getElementById(id);
let records = [];
let selectedId = null;

const form = $("function-form");
const list = $("function-list");

function showMessage(message, error = false) {
  const node = $("form-message");
  node.textContent = message;
  node.classList.toggle("error", error);
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function validateCoordinates() {
  const latText = $("latitude").value.trim();
  const lngText = $("longitude").value.trim();
  if (latText === "" || lngText === "") return "Ingresá latitud y longitud.";
  const lat = Number(latText), lng = Number(lngText);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "Las coordenadas deben ser números.";
  if (lat < -90 || lat > 90) return "Latitud inválida: debe estar entre -90 y 90. El valor 95 está fuera del rango permitido.";
  if (lng < -180 || lng > 180) return "Longitud inválida: debe estar entre -180 y 180.";
  return null;
}
function setMap(record) {
  selectedId = record.id;
  $("map-title").textContent = record.point_name;
  $("map-hint").textContent = `${record.movie} · ${record.start_time.slice(0,5)} · ${record.genre}`;
  $("coordinates").textContent = `Latitud: ${record.latitude} · Longitud: ${record.longitude}`;
  const query = `${record.latitude},${record.longitude}`;
  $("map-frame").src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
  $("open-map").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  renderList();
}
function renderList() {
  const genre = $("genre-filter").value;
  const visible = records.filter(r => genre === "Todos" || r.genre === genre);
  $("record-count").textContent = `${visible.length} ${visible.length === 1 ? "función" : "funciones"}`;
  if (!visible.length) {
    list.innerHTML = '<p class="empty-state">No hay funciones para este filtro.</p>';
    return;
  }
  list.innerHTML = visible.map(r => `
    <article class="function-card ${r.id === selectedId ? "selected" : ""}" data-select="${r.id}">
      <div class="card-top">
        <div><p class="movie-name">${escapeHTML(r.movie)}</p><p class="point-name">${escapeHTML(r.point_name)}</p></div>
        <span class="genre-pill ${r.genre === "Aventura" ? "adventure" : ""}">${escapeHTML(r.genre)}</span>
      </div>
      <div class="card-meta"><span>◷ ${escapeHTML(r.start_time.slice(0,5))}</span><span>⌖ ${Number(r.latitude).toFixed(5)}, ${Number(r.longitude).toFixed(5)}</span></div>
      <div class="card-actions">
        <button class="small-button" data-edit="${r.id}" type="button">Editar</button>
        <button class="small-button delete" data-delete="${r.id}" type="button">Eliminar</button>
      </div>
    </article>`).join("");
  list.querySelectorAll("[data-select]").forEach(el => el.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    const record = records.find(r => String(r.id) === el.dataset.select);
    if (record) setMap(record);
  }));
  list.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => editRecord(btn.dataset.edit)));
  list.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => deleteRecord(btn.dataset.delete)));
}
async function loadRecords() {
  if (!client) {
    $("setup-warning").hidden = false;
    list.innerHTML = '<p class="empty-state">Configurá Supabase en app.js para cargar los registros.</p>';
    return;
  }
  list.innerHTML = '<p class="empty-state">Cargando funciones…</p>';
  const { data, error } = await client.from("funciones").select("*").order("created_at", { ascending: true });
  if (error) {
    list.innerHTML = `<p class="empty-state">No se pudieron cargar los datos: ${escapeHTML(error.message)}. Revisá la tabla y las políticas RLS en Supabase.</p>`;
    return;
  }
  records = data || [];
  renderList();
  if (selectedId) {
    const current = records.find(r => String(r.id) === String(selectedId));
    if (current) setMap(current);
  }
}
function resetForm() {
  form.reset();
  $("record-id").value = "";
  $("form-title").textContent = "Agregar una función";
  $("save-button").textContent = "Guardar función";
  $("cancel-edit").hidden = true;
}
async function editRecord(id) {
  const r = records.find(item => String(item.id) === String(id));
  if (!r) return;
  $("record-id").value = r.id;
  $("point-name").value = r.point_name;
  $("movie").value = r.movie;
  $("start-time").value = r.start_time.slice(0,5);
  $("genre").value = r.genre;
  $("latitude").value = r.latitude;
  $("longitude").value = r.longitude;
  $("form-title").textContent = "Editar función";
  $("save-button").textContent = "Guardar cambios";
  $("cancel-edit").hidden = false;
  showMessage("Editando la función seleccionada.");
  window.scrollTo({top: $("function-form").getBoundingClientRect().top + window.scrollY - 20, behavior:"smooth"});
}
async function deleteRecord(id) {
  const r = records.find(item => String(item.id) === String(id));
  if (!r || !confirm(`¿Eliminar la función "${r.movie}"?`)) return;
  const { error } = await client.from("funciones").delete().eq("id", id);
  if (error) return showMessage(`No se pudo eliminar: ${error.message}`, true);
  if (String(selectedId) === String(id)) {
    selectedId = null;
    $("map-title").textContent = "Elegí una función";
    $("map-hint").textContent = "Seleccioná una tarjeta para ver dónde se instalará la pantalla.";
    $("coordinates").textContent = "Latitud: — · Longitud: —";
    $("map-frame").src = "https://www.google.com/maps?q=Asunci%C3%B3n%2C%20Paraguay&output=embed";
    $("open-map").href = "https://www.google.com/maps";
  }
  showMessage("Función eliminada correctamente.");
  await loadRecords();
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!client) return showMessage("Primero configurá Supabase en app.js.", true);
  const coordinateError = validateCoordinates();
  if (coordinateError) return showMessage(coordinateError, true);
  const payload = {
    point_name: $("point-name").value.trim(),
    movie: $("movie").value.trim(),
    start_time: $("start-time").value,
    genre: $("genre").value,
    latitude: Number($("latitude").value),
    longitude: Number($("longitude").value)
  };
  if (!payload.point_name || !payload.movie || !payload.start_time || !payload.genre)
    return showMessage("Completá todos los campos.", true);
  const id = $("record-id").value;
  const result = id
    ? await client.from("funciones").update(payload).eq("id", id).select().single()
    : await client.from("funciones").insert(payload).select().single();
  if (result.error) return showMessage(`Error al guardar: ${result.error.message}`, true);
  resetForm();
  showMessage(id ? "Cambios guardados correctamente." : "Función creada correctamente.");
  await loadRecords();
  if (result.data) setMap(result.data);
});
$("cancel-edit").addEventListener("click", () => { resetForm(); showMessage(""); });
$("genre-filter").addEventListener("change", renderList);
$("refresh-button").addEventListener("click", loadRecords);

loadRecords();

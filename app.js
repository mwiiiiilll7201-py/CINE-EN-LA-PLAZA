
const SUPABASE_URL = "https://oskkqlrqztkcxvzvmmqn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_CCFzJYKceC9n4-5CfdR8cw_Tnv0S3K3";

const configured =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_ANON_KEY.startsWith("sb_publishable_");

const supabaseClient = configured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const form = document.getElementById("functionForm");
const pointName = document.getElementById("pointName");
const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");
const movie = document.getElementById("movie");
const startTime = document.getElementById("startTime");
const genre = document.getElementById("genre");
const recordsContainer = document.getElementById("records");
const message = document.getElementById("message");
const filterGenre = document.getElementById("filterGenre");

let functionsList = [];
let editingId = null;

function showMessage(text, type = "info") {
  if (!message) return;
  message.textContent = text;
  message.className = `message ${type}`;
}

function validCoordinates(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

async function loadFunctions() {
  if (!supabaseClient) {
    showMessage("Revisa la configuración de Supabase.", "error");
    return;
  }

  const { data, error } = await supabaseClient
    .from("funciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    showMessage("Error al cargar: " + error.message, "error");
    return;
  }

  functionsList = data || [];
  renderFunctions();
}

function renderFunctions() {
  if (!recordsContainer) return;

  const selectedGenre = filterGenre?.value || "Todos";

  const filtered = functionsList.filter((item) =>
    selectedGenre === "Todos" || item.genre === selectedGenre
  );

  if (filtered.length === 0) {
    recordsContainer.innerHTML = "<p>No hay funciones registradas.</p>";
    return;
  }

  recordsContainer.innerHTML = filtered.map((item) => {
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;

    return `
      <article class="function-card">
        <h3>${escapeHTML(item.movie)}</h3>
        <p><strong>Plaza:</strong> ${escapeHTML(item.point_name)}</p>
        <p><strong>Género:</strong> ${escapeHTML(item.genre)}</p>
        <p><strong>Horario:</strong> ${escapeHTML(item.start_time)}</p>
        <p><strong>Latitud:</strong> ${lat}</p>
        <p><strong>Longitud:</strong> ${lng}</p>
        <iframe
          title="Mapa de ${escapeHTML(item.point_name)}"
          src="${mapUrl}"
          width="100%"
          height="200"
          style="border:0"
          loading="lazy"
          allowfullscreen>
        </iframe>
        <div class="card-actions">
          <button type="button" onclick="editFunction('${item.id}')">
            Editar
          </button>
          <button type="button" onclick="deleteFunction('${item.id}')">
            Eliminar
          </button>
        </div>
      </article>
    `;
  }).join("");
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!supabaseClient) {
    showMessage("Supabase no está configurado.", "error");
    return;
  }

  const lat = Number(latitude.value);
  const lng = Number(longitude.value);

  if (!validCoordinates(lat, lng)) {
    showMessage("Ingresá coordenadas válidas.", "error");
    return;
  }

  const record = {
    point_name: pointName.value.trim(),
    latitude: lat,
    longitude: lng,
    movie: movie.value.trim(),
    start_time: startTime.value,
    genre: genre.value
  };

  if (!record.point_name || !record.movie || !record.start_time) {
    showMessage("Completá todos los campos.", "error");
    return;
  }

  let result;

  if (editingId) {
    result = await supabaseClient
      .from("funciones")
      .update(record)
      .eq("id", editingId);
  } else {
    result = await supabaseClient
      .from("funciones")
      .insert([record]);
  }

  if (result.error) {
    showMessage("Error al guardar: " + result.error.message, "error");
    return;
  }

  showMessage(
    editingId ? "Función actualizada correctamente." : "Función guardada correctamente.",
    "success"
  );

  editingId = null;
  form.reset();
  await loadFunctions();
});

window.editFunction = function (id) {
  const item = functionsList.find((record) => String(record.id) === String(id));
  if (!item) return;

  pointName.value = item.point_name;
  latitude.value = item.latitude;
  longitude.value = item.longitude;
  movie.value = item.movie;
  startTime.value = item.start_time;
  genre.value = item.genre;

  editingId = item.id;
  showMessage("Editando función. Modificá los datos y guardá.", "info");
  form?.scrollIntoView({ behavior: "smooth" });
};

window.deleteFunction = async function (id) {
  if (!confirm("¿Seguro que querés eliminar esta función?")) return;

  const { error } = await supabaseClient
    .from("funciones")
    .delete()
    .eq("id", id);

  if (error) {
    showMessage("Error al eliminar: " + error.message, "error");
    return;
  }

  showMessage("Función eliminada correctamente.", "success");
  await loadFunctions();
};

filterGenre?.addEventListener("change", renderFunctions);

if (window.supabase && configured) {
  loadFunctions();
} else {
  showMessage("No se pudo iniciar Supabase. Revisá la configuración.", "error");
}

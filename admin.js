const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://127.0.0.1:8000"
  : "https://sidreria-el-tonel.onrender.com";

let token = localStorage.getItem("tonel_admin_token");

const loginPanel = document.querySelector("#loginPanel");
const contentPanel = document.querySelector("#contentPanel");
const message = document.querySelector("#message");
const logoutBtn = document.querySelector("#logoutBtn");

function setMessage(text = "", type = "") {
  message.textContent = text;
  message.className = `message ${type}`;
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "No se pudo completar la operación");
  return data;
}

function showAdmin() {
  loginPanel.hidden = true;
  contentPanel.hidden = false;
  logoutBtn.hidden = false;
  loadAdmin();
}

function showLogin() {
  token = null;
  localStorage.removeItem("tonel_admin_token");
  loginPanel.hidden = false;
  contentPanel.hidden = true;
  logoutBtn.hidden = true;
}

function integrationBadge(label, active) {
  return `<span class="${active ? "ok" : ""}">${label}: ${active ? "conectado" : "pendiente"}</span>`;
}

function renderPhotos(photos) {
  const list = document.querySelector("#photoList");
  if (!photos.length) {
    list.innerHTML = "<p>No hay fotografías. Sube la primera desde el formulario superior.</p>";
    return;
  }
  list.innerHTML = photos.map((photo) => `
    <article class="photo-item" data-photo-id="${photo.id}">
      <img src="${photo.url}" alt="" />
      <label>Descripción<input data-field="alt" value="${escapeHtml(photo.alt)}" /></label>
      <label>Orden<input data-field="orden" type="number" min="0" value="${photo.orden}" /></label>
      <label>Visibilidad<select data-field="activa"><option value="true" ${photo.activa ? "selected" : ""}>Visible</option><option value="false" ${!photo.activa ? "selected" : ""}>Oculta</option></select></label>
      <div class="photo-actions"><button data-action="save" class="secondary">Guardar</button><button data-action="delete" class="danger">Eliminar</button></div>
    </article>
  `).join("");
}

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

async function loadAdmin() {
  try {
    const [photos, config] = await Promise.all([
      api("/contenido/fotos/admin"),
      api("/contenido/configuracion"),
    ]);
    renderPhotos(photos);
    document.querySelector("#integrationStatus").innerHTML = [
      integrationBadge("Fotos", config.cloudinary),
      integrationBadge("Calendar", config.google_calendar),
      integrationBadge("Reseñas", config.google_reviews),
    ].join("");
  } catch (error) {
    if (/token|autorizado|credenciales/i.test(error.message)) showLogin();
    setMessage(error.message, "error");
  }
}

document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  document.querySelector(".login-error")?.remove();
  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.querySelector("#email").value,
        password: document.querySelector("#password").value,
      }),
    });
    if (data.user.rol !== "admin") throw new Error("Este panel requiere un administrador");
    token = data.access_token;
    localStorage.setItem("tonel_admin_token", token);
    showAdmin();
  } catch (error) {
    const loginMessage = document.createElement("p");
    loginMessage.className = "message error login-error";
    loginMessage.textContent = error.message;
    document.querySelector("#loginForm").append(loginMessage);
  }
});

document.querySelector("#uploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData();
  form.append("archivo", document.querySelector("#archivo").files[0]);
  form.append("alt", document.querySelector("#alt").value);
  form.append("orden", document.querySelector("#orden").value);
  try {
    setMessage("Subiendo fotografía...");
    await api("/contenido/fotos", { method: "POST", body: form });
    event.target.reset();
    setMessage("Fotografía publicada.", "success");
    await loadAdmin();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

document.querySelector("#photoList").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = button.closest("[data-photo-id]");
  const id = Number(item.dataset.photoId);
  try {
    if (button.dataset.action === "save") {
      await api(`/contenido/fotos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          alt: item.querySelector('[data-field="alt"]').value,
          orden: Number(item.querySelector('[data-field="orden"]').value),
          activa: item.querySelector('[data-field="activa"]').value === "true",
        }),
      });
      setMessage("Cambios guardados.", "success");
    }
    if (button.dataset.action === "delete" && confirm("¿Eliminar esta fotografía?")) {
      await api(`/contenido/fotos/${id}`, { method: "DELETE" });
      setMessage("Fotografía eliminada.", "success");
    }
    await loadAdmin();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

logoutBtn.addEventListener("click", showLogin);
if (token) showAdmin();

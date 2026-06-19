import "./style.css";

const isLocalNetwork =
  ["localhost", "127.0.0.1"].includes(window.location.hostname) ||
  /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname);

const API_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalNetwork
    ? `http://${["localhost", "127.0.0.1"].includes(window.location.hostname) ? "127.0.0.1" : window.location.hostname}:8000`
    : "https://sidreria-el-tonel.onrender.com");

const horaActual = new Date().toTimeString().slice(0, 5);

const state = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  activeTab: "dashboard",
  reservas: [],
  mesas: [],
  usuarios: [],
  stats: null,
  selectedReservaId: null,
  selectedMesaId: null,
  filters: {
    fecha: new Date().toISOString().slice(0, 10),
    hora: horaActual >= "11:30" && horaActual <= "23:00" ? horaActual : "11:30",
    estado: "",
    zona: "",
  },
};

const app = document.querySelector("#app");
let deferredInstallPrompt = null;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  renderInstallButton();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  renderInstallButton();
});

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function puedeGestionarReservas() {
  return state.user?.rol === "admin" || state.user?.rol === "encargado";
}

function puedeAdministrar() {
  return state.user?.rol === "admin";
}

function formatHora(value = "") {
  return String(value).slice(0, 5);
}

function zonaLabel(zona) {
  return zona === "exterior" ? "Terraza exterior" : "Comedor interior";
}

function sugerirHoraFin() {
  const inicio = document.querySelector("#hora");
  const fin = document.querySelector("#horaFin");
  if (!inicio?.value || !fin) return;
  const [horas, minutos] = inicio.value.split(":").map(Number);
  const total = Math.min(horas * 60 + minutos + 120, 23 * 60);
  fin.value = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  fin.min = inicio.value;
}

function getSelectedReserva() {
  return state.reservas.find((reserva) => reserva.id === state.selectedReservaId) || null;
}

function getSelectedMesa() {
  return state.mesas.find((mesa) => mesa.id === state.selectedMesaId) || null;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${state.token}`,
  };
}

async function api(path, options = {}) {
  const headers = options.auth === false ? { "Content-Type": "application/json" } : authHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    if (options.auth !== false) cerrarSesion(false);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const detail = Array.isArray(data?.detail)
      ? data.detail.map((item) => item.msg).join(". ")
      : data?.detail;
    throw new Error(detail || "No se pudo completar la operación");
  }

  return data;
}

function setMessage(text = "", type = "info") {
  const message = document.querySelector("#message");
  if (!message) return;
  message.className = `message ${type}`;
  message.textContent = text;
}

function renderInstallButton() {
  const target = document.querySelector("#installAppBtn");
  if (!target) return;
  target.hidden = !deferredInstallPrompt;
}

function renderLogin() {
  app.innerHTML = `
    <main class="auth-shell">
      <section class="auth-panel">
        <p class="eyebrow">Panel interno</p>
        <h1>Sidrería El Tonel</h1>
        <form id="formLogin" class="form">
          <label>
            Email
            <input id="loginEmail" type="email" autocomplete="username" required />
          </label>
          <label>
            Contraseña
            <input id="loginPassword" type="password" autocomplete="current-password" required />
          </label>
          <button type="submit">Entrar</button>
        </form>
        <p id="message" class="message"></p>
      </section>
    </main>
  `;

  document.querySelector("#formLogin").addEventListener("submit", login);
}

function renderApp() {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div>
          <p class="eyebrow">Sidrería El Tonel</p>
          <h1>Reservas</h1>
        </div>
        <nav class="nav-tabs">
          <button class="${state.activeTab === "dashboard" ? "active" : ""}" data-tab="dashboard">Dashboard</button>
          <button class="${state.activeTab === "reservas" ? "active" : ""}" data-tab="reservas">Reservas</button>
          <button class="${state.activeTab === "calendario" ? "active" : ""}" data-tab="calendario">Calendario</button>
          <button class="${state.activeTab === "mesas" ? "active" : ""}" data-tab="mesas">Mesas</button>
          ${puedeAdministrar() ? `<button class="${state.activeTab === "usuarios" ? "active" : ""}" data-tab="usuarios">Usuarios</button>` : ""}
        </nav>
        <div class="user-box">
          <strong>${escapeHtml(state.user.nombre)}</strong>
          <span>${escapeHtml(state.user.rol)}</span>
          <button id="installAppBtn" class="secondary" ${deferredInstallPrompt ? "" : "hidden"}>Instalar app</button>
          <small class="install-help">iPhone: Compartir > Añadir a pantalla de inicio</small>
          ${puedeAdministrar() ? `<a class="sidebar-link" href="../admin.html">Fotos web</a>` : ""}
          <button id="logoutBtn" class="secondary">Salir</button>
        </div>
      </aside>
      <main class="workspace">
        <div id="message" class="message"></div>
        ${renderTab()}
        ${renderReservaDetalle()}
        ${renderMesaDetalle()}
      </main>
    </div>
  `;

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      state.selectedMesaId = null;
      renderApp();
      cargarDatosVista();
    });
  });

  document.querySelector("#logoutBtn").addEventListener("click", () => cerrarSesion());
  document.querySelector("#installAppBtn")?.addEventListener("click", instalarApp);
  conectarEventosVista();
}

async function instalarApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  renderInstallButton();
}

function renderTab() {
  if (state.activeTab === "dashboard") return renderDashboard();
  if (state.activeTab === "calendario") return renderCalendario();
  if (state.activeTab === "mesas") return renderMesas();
  if (state.activeTab === "usuarios" && puedeAdministrar()) return renderUsuarios();
  return renderReservas();
}

function renderDashboard() {
  const stats = state.stats || {
    reservas_hoy: 0,
    pendientes_hoy: 0,
    confirmadas_hoy: 0,
    canceladas_hoy: 0,
    reservas_semana: 0,
    canceladas_semana: 0,
    ocupacion_hoy: 0,
    proximas_reservas: [],
  };

  return `
    <section class="toolbar">
      <div>
        <p class="eyebrow">Vista general</p>
        <h2>Dashboard</h2>
      </div>
      <button id="cargarDashboard">Actualizar</button>
    </section>

    <section class="dashboard-grid">
      ${renderStatCard("Pendientes", stats.pendientes_hoy, "warm")}
      ${renderStatCard("Confirmadas", stats.confirmadas_hoy, "good")}
      ${renderStatCard("Hoy", stats.reservas_hoy, "cool")}
      ${renderStatCard("Canceladas", stats.canceladas_hoy, "bad")}
    </section>

    <section class="dashboard-layout">
      <article class="panel">
        <div class="section-title">
          <h3>Próximas reservas</h3>
          <span>${stats.proximas_reservas.length} activas</span>
        </div>
        <div class="list compact-list">
          ${
            stats.proximas_reservas.length
              ? stats.proximas_reservas.map(renderReservaCompacta).join("")
              : `<p class="empty">No hay próximas reservas pendientes o confirmadas.</p>`
          }
        </div>
      </article>

      <article class="panel stats-panel">
        <div class="section-title">
          <h3>Estadísticas</h3>
        </div>
        <div class="stats-stack">
          ${renderProgress("Ocupación hoy", stats.ocupacion_hoy, "%")}
          ${renderProgress("Reservas semana", stats.reservas_semana, "")}
          ${renderProgress("Canceladas semana", stats.canceladas_semana, "")}
        </div>
      </article>
    </section>
  `;
}

function renderStatCard(label, value, tone) {
  return `
    <article class="stat-card ${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
      <div class="sparkline" aria-hidden="true"></div>
    </article>
  `;
}

function renderReservaCompacta(reserva) {
  return `
    <article class="compact-row">
      <strong>${escapeHtml(formatHora(reserva.hora))}–${escapeHtml(formatHora(reserva.hora_fin))} · ${escapeHtml(reserva.cliente_nombre)}</strong>
      <span>${reserva.personas} personas · ${zonaLabel(reserva.zona_preferida)} · ${escapeHtml(reserva.fecha)} · Mesa ${reserva.mesa_id ?? "sin asignar"}</span>
      <em class="status ${escapeHtml(reserva.estado)}">${escapeHtml(reserva.estado)}</em>
    </article>
  `;
}

function renderProgress(label, value, suffix) {
  const percent = suffix === "%" ? Math.min(Number(value), 100) : Math.min(Number(value) * 4, 100);
  return `
    <div class="progress-row">
      <div>
        <span>${label}</span>
        <strong>${value}${suffix}</strong>
      </div>
      <div class="progress-track">
        <div style="width: ${percent}%"></div>
      </div>
    </div>
  `;
}

function renderReservas() {
  return `
    <section class="toolbar">
      <div>
        <p class="eyebrow">Operativa diaria</p>
        <h2>Reservas</h2>
      </div>
      <div class="filters">
        <input id="filtroFecha" type="date" value="${state.filters.fecha}" />
        <select id="filtroEstado">
          <option value="">Todos</option>
          <option value="pendiente" ${state.filters.estado === "pendiente" ? "selected" : ""}>Pendientes</option>
          <option value="confirmada" ${state.filters.estado === "confirmada" ? "selected" : ""}>Confirmadas</option>
          <option value="cancelada" ${state.filters.estado === "cancelada" ? "selected" : ""}>Canceladas</option>
        </select>
        <select id="filtroZona">
          <option value="">Todos los comedores</option>
          <option value="interior" ${state.filters.zona === "interior" ? "selected" : ""}>Comedor interior</option>
          <option value="exterior" ${state.filters.zona === "exterior" ? "selected" : ""}>Terraza exterior</option>
        </select>
        <button id="cargarReservas">Actualizar</button>
      </div>
    </section>

    <section class="summary-grid">
      ${renderMetric("Pendientes", state.reservas.filter((item) => item.estado === "pendiente").length)}
      ${renderMetric("Confirmadas", state.reservas.filter((item) => item.estado === "confirmada").length)}
      ${renderMetric("Interior", state.reservas.filter((item) => item.estado !== "cancelada" && item.zona_preferida === "interior").length)}
      ${renderMetric("Exterior", state.reservas.filter((item) => item.estado !== "cancelada" && item.zona_preferida === "exterior").length)}
    </section>

    ${puedeGestionarReservas() ? renderReservaForm() : ""}

    <section class="panel">
      <div class="section-title">
        <h3>Listado</h3>
        <span>${state.reservas.length} reservas</span>
      </div>
      <div id="reservas" class="list">
        ${state.reservas.length ? state.reservas.map(renderReservaCard).join("") : `<p class="empty">No hay reservas para los filtros seleccionados.</p>`}
      </div>
    </section>
  `;
}

function renderCalendario() {
  const horas = [
    "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
    "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
    "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00",
  ];

  return `
    <section class="toolbar">
      <div>
        <p class="eyebrow">Agenda</p>
        <h2>Calendario diario</h2>
      </div>
      <div class="filters">
        <input id="filtroFecha" type="date" value="${state.filters.fecha}" />
        <button id="cargarCalendario">Actualizar</button>
      </div>
    </section>

    <section class="calendar-board">
      ${horas.map((hora) => renderCalendarSlot(hora)).join("")}
    </section>
  `;
}

function renderCalendarSlot(hora) {
  const reservasHora = state.reservas.filter((reserva) => formatHora(reserva.hora) === hora);
  return `
    <article class="calendar-slot ${reservasHora.length ? "has-items" : ""}">
      <time>${hora}</time>
      <div>
        ${
          reservasHora.length
            ? reservasHora.map((reserva) => `
              <button class="calendar-item estado-${escapeHtml(reserva.estado)}" data-action="detalle" data-id="${reserva.id}">
                <strong>${escapeHtml(reserva.cliente_nombre)}</strong>
                <span>${formatHora(reserva.hora)}–${formatHora(reserva.hora_fin)} · ${reserva.personas} personas · ${zonaLabel(reserva.zona_preferida)} · Mesa ${reserva.mesa_id ?? "sin asignar"}</span>
              </button>
            `).join("")
            : `<span class="calendar-empty">Libre</span>`
        }
      </div>
    </article>
  `;
}

function renderMetric(label, value) {
  return `
    <article class="metric">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function renderReservaForm() {
  return `
    <section class="panel">
      <div class="section-title">
        <h3>Nueva reserva</h3>
      </div>
      <form id="formReserva" class="form inline-form">
        <input id="nombre" placeholder="Nombre del cliente" required />
        <input id="telefono" placeholder="Teléfono" required />
        <input id="personas" type="number" min="1" placeholder="Personas" required />
        <input id="fecha" type="date" value="${state.filters.fecha}" required />
        <label class="form-field">Inicio<input id="hora" type="time" min="11:30" max="22:59" required /></label>
        <label class="form-field">Fin<input id="horaFin" type="time" min="11:31" max="23:00" required /></label>
        <select id="zonaPreferida" required>
          <option value="interior">Comedor interior</option>
          <option value="exterior">Terraza exterior</option>
        </select>
        <input id="observaciones" placeholder="Observaciones" />
        <button type="submit">Crear</button>
      </form>
    </section>
  `;
}

function renderReservaCard(reserva) {
  const mesasDisponibles = state.mesas.filter((mesa) => mesa.activa && mesa.zona === reserva.zona_preferida && mesa.capacidad >= reserva.personas);
  return `
    <article class="row-card estado-${escapeHtml(reserva.estado)}">
      <div>
        <h3>${escapeHtml(reserva.cliente_nombre)}</h3>
        <p>${escapeHtml(reserva.cliente_telefono)} · ${reserva.personas} personas</p>
        <p>${escapeHtml(reserva.fecha)} · ${escapeHtml(formatHora(reserva.hora))}–${escapeHtml(formatHora(reserva.hora_fin))} · ${zonaLabel(reserva.zona_preferida)} · Mesa ${reserva.mesa_id ?? "sin asignar"}</p>
        ${reserva.observaciones ? `<p class="note">${escapeHtml(reserva.observaciones)}</p>` : ""}
      </div>
      <span class="status ${escapeHtml(reserva.estado)}">${escapeHtml(reserva.estado)}</span>
      ${
        puedeGestionarReservas()
          ? `
        <div class="actions">
          <select data-mesa-reserva="${reserva.id}">
            <option value="">Asignar mesa</option>
            ${mesasDisponibles.map((mesa) => `<option value="${mesa.id}" ${mesa.id === reserva.mesa_id ? "selected" : ""}>${escapeHtml(mesa.nombre)} (${mesa.capacidad})</option>`).join("")}
          </select>
          <button data-action="asignar" data-id="${reserva.id}" class="secondary">Asignar</button>
          <button data-action="detalle" data-id="${reserva.id}" class="secondary">Ver detalle</button>
          <button data-action="confirmar" data-id="${reserva.id}">Confirmar</button>
          <button data-action="cancelar" data-id="${reserva.id}" class="danger">Cancelar</button>
        </div>
      `
          : ""
      }
    </article>
  `;
}

function renderReservaDetalle() {
  const reserva = getSelectedReserva();
  if (!reserva) return "";

  const mesasDisponibles = state.mesas.filter((mesa) => mesa.activa && mesa.zona === reserva.zona_preferida && mesa.capacidad >= reserva.personas);
  return `
    <div class="modal-backdrop" role="presentation">
      <section class="reservation-detail" role="dialog" aria-modal="true" aria-labelledby="detalleReservaTitulo">
        <header>
          <button data-action="cerrar-detalle" class="icon-button" aria-label="Cerrar">×</button>
          <div>
            <p class="eyebrow">Reserva #${reserva.id}</p>
            <h2 id="detalleReservaTitulo">${escapeHtml(reserva.cliente_nombre)}</h2>
          </div>
          <span class="status ${escapeHtml(reserva.estado)}">${escapeHtml(reserva.estado)}</span>
        </header>

        <div class="detail-grid">
          ${renderDetailItem("Teléfono", reserva.cliente_telefono)}
          ${renderDetailItem("Fecha", reserva.fecha)}
          ${renderDetailItem("Hora", formatHora(reserva.hora))}
          ${renderDetailItem("Hora de fin", formatHora(reserva.hora_fin))}
          ${renderDetailItem("Personas", reserva.personas)}
          ${renderDetailItem("Comedor", zonaLabel(reserva.zona_preferida))}
          ${renderDetailItem("Mesa asignada", reserva.mesa_id ?? "Sin asignar")}
          ${renderDetailItem("Google Calendar", reserva.google_event_id ? "Sincronizada" : "No sincronizada")}
          ${renderDetailItem("Observaciones", reserva.observaciones || "Sin observaciones")}
        </div>

        ${
          puedeGestionarReservas()
            ? `
          <div class="detail-actions">
            <select data-mesa-reserva="${reserva.id}">
              <option value="">Asignar mesa</option>
              ${mesasDisponibles.map((mesa) => `<option value="${mesa.id}" ${mesa.id === reserva.mesa_id ? "selected" : ""}>${escapeHtml(mesa.nombre)} (${mesa.capacidad})</option>`).join("")}
            </select>
            <button data-action="asignar" data-id="${reserva.id}" class="secondary">Asignar mesa</button>
            <button data-action="confirmar" data-id="${reserva.id}">Confirmar</button>
            <button data-action="cancelar" data-id="${reserva.id}" class="danger">Cancelar</button>
          </div>
        `
            : ""
        }
      </section>
    </div>
  `;
}

function renderDetailItem(label, value) {
  return `
    <div class="detail-item">
      <span>${label}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderMesas() {
  return `
    <section class="toolbar">
      <div>
        <p class="eyebrow">Sala</p>
        <h2>Plano de mesas</h2>
      </div>
      <div class="filters">
        <input id="filtroFecha" type="date" value="${state.filters.fecha}" />
        <input id="filtroHora" type="time" min="11:30" max="23:00" value="${state.filters.hora}" aria-label="Hora de consulta" />
        <button id="cargarMesas">Actualizar</button>
      </div>
    </section>

    <div class="leyenda">
      <span class="leyenda-item libre">Libre</span>
      <span class="leyenda-item pendiente">Pendiente</span>
      <span class="leyenda-item confirmada">Confirmada</span>
      <span class="leyenda-item inactiva">Inactiva</span>
    </div>

    <section class="dining-area">
      <div class="section-title">
        <h3>Comedor interior</h3>
        <span>${state.mesas.filter((mesa) => mesa.zona === "interior").length} mesas</span>
      </div>
      <div class="mesas-grid floor-plan interior-plan">
        ${state.mesas.some((mesa) => mesa.zona === "interior") ? state.mesas.filter((mesa) => mesa.zona === "interior").map(renderMesaCard).join("") : `<p class="empty">No hay mesas en el comedor interior.</p>`}
      </div>
    </section>

    <section class="dining-area">
      <div class="section-title">
        <h3>Terraza exterior</h3>
        <span>${state.mesas.filter((mesa) => mesa.zona === "exterior").length} mesas</span>
      </div>
      <div class="mesas-grid floor-plan exterior-plan">
        ${state.mesas.some((mesa) => mesa.zona === "exterior") ? state.mesas.filter((mesa) => mesa.zona === "exterior").map(renderMesaCard).join("") : `<p class="empty">No hay mesas en la terraza exterior.</p>`}
      </div>
    </section>

    ${
      puedeAdministrar()
        ? `
      <section class="panel">
        <div class="section-title">
          <h3>Crear mesa</h3>
        </div>
        <form id="formMesa" class="form inline-form">
          <input id="mesaNombre" placeholder="Nombre de la mesa" required />
          <input id="mesaCapacidad" type="number" min="1" placeholder="Capacidad" required />
          <select id="mesaZona" required>
            <option value="interior">Comedor interior</option>
            <option value="exterior">Terraza exterior</option>
          </select>
          <button type="submit">Crear</button>
        </form>
      </section>
    `
        : ""
    }
  `;
}

function renderMesaCard(mesa) {
  return `
    <article class="mesa-card mesa-${escapeHtml(mesa.estado)}">
      <h3>${escapeHtml(mesa.nombre)}</h3>
      <p>${mesa.capacidad} personas · ${zonaLabel(mesa.zona)}</p>
      <strong>${escapeHtml(mesa.estado)}</strong>
      ${puedeAdministrar() ? `
        <div class="mesa-actions">
          <button data-action="editar-mesa" data-id="${mesa.id}" class="secondary">Editar</button>
          <button data-action="toggle-mesa" data-id="${mesa.id}" data-activa="${mesa.activa}" class="${mesa.activa ? "danger" : "secondary"}">${mesa.activa ? "Desactivar" : "Activar"}</button>
        </div>
      ` : ""}
    </article>
  `;
}

function renderMesaDetalle() {
  if (!puedeAdministrar() || state.activeTab !== "mesas") return "";
  const mesa = getSelectedMesa();
  if (!mesa) return "";

  return `
    <div class="modal-backdrop" role="presentation">
      <section class="reservation-detail" role="dialog" aria-modal="true" aria-labelledby="editarMesaTitulo">
        <header>
          <button type="button" data-action="cerrar-edicion-mesa" class="icon-button" aria-label="Cerrar">×</button>
          <div>
            <p class="eyebrow">Mesa #${mesa.id}</p>
            <h2 id="editarMesaTitulo">Editar mesa</h2>
          </div>
          <span class="status ${mesa.activa ? "confirmada" : "cancelada"}">${mesa.activa ? "Activa" : "Inactiva"}</span>
        </header>
        <form id="editarMesaForm" class="form edit-table-form">
          <label>
            Nombre
            <input id="editarMesaNombre" value="${escapeHtml(mesa.nombre)}" required />
          </label>
          <label>
            Capacidad
            <input id="editarMesaCapacidad" type="number" min="1" value="${mesa.capacidad}" required />
          </label>
          <label>
            Comedor
            <select id="editarMesaZona" required>
              <option value="interior" ${mesa.zona === "interior" ? "selected" : ""}>Comedor interior</option>
              <option value="exterior" ${mesa.zona === "exterior" ? "selected" : ""}>Terraza exterior</option>
            </select>
          </label>
          <label>
            Estado
            <select id="editarMesaActiva" required>
              <option value="true" ${mesa.activa ? "selected" : ""}>Activa</option>
              <option value="false" ${!mesa.activa ? "selected" : ""}>Inactiva</option>
            </select>
          </label>
          <div class="detail-actions">
            <button type="button" data-action="cerrar-edicion-mesa" class="secondary">Cancelar</button>
            <button type="submit">Guardar cambios</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderUsuarios() {
  return `
    <section class="toolbar">
      <div>
        <p class="eyebrow">Equipo</p>
        <h2>Usuarios</h2>
      </div>
      <button id="cargarUsuarios">Actualizar</button>
    </section>

    <section class="panel">
      <div class="section-title">
        <h3>Crear usuario</h3>
      </div>
      <form id="formUsuario" class="form inline-form">
        <input id="usuarioNombre" placeholder="Nombre" required />
        <input id="usuarioEmail" type="email" placeholder="Email" required />
        <input id="usuarioPassword" type="password" minlength="6" placeholder="Contraseña" required />
        <select id="usuarioRol">
          <option value="empleado">Empleado</option>
          <option value="encargado">Encargado</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit">Crear</button>
      </form>
    </section>

    <section class="list">
      ${state.usuarios.length ? state.usuarios.map(renderUsuarioCard).join("") : `<p class="empty">No hay usuarios cargados.</p>`}
    </section>
  `;
}

function renderUsuarioCard(usuario) {
  return `
    <article class="row-card">
      <div>
        <h3>${escapeHtml(usuario.nombre)}</h3>
        <p>${escapeHtml(usuario.email)} · ${escapeHtml(usuario.rol)}</p>
      </div>
      <span class="status ${usuario.activo ? "confirmada" : "cancelada"}">${usuario.activo ? "Activo" : "Inactivo"}</span>
      <button data-action="toggle-usuario" data-id="${usuario.id}" class="secondary" ${usuario.id === state.user.id ? "disabled" : ""}>
        ${usuario.activo ? "Desactivar" : "Activar"}
      </button>
    </article>
  `;
}

function conectarEventosVista() {
  document.querySelector("#cargarReservas")?.addEventListener("click", cargarReservasDesdeFiltros);
  document.querySelector("#cargarMesas")?.addEventListener("click", cargarMesasDesdeFiltros);
  document.querySelector("#cargarUsuarios")?.addEventListener("click", cargarUsuarios);
  document.querySelector("#cargarDashboard")?.addEventListener("click", cargarDashboard);
  document.querySelector("#cargarCalendario")?.addEventListener("click", cargarCalendarioDesdeFiltros);
  document.querySelector("#formReserva")?.addEventListener("submit", crearReserva);
  document.querySelector("#formMesa")?.addEventListener("submit", crearMesa);
  document.querySelector("#editarMesaForm")?.addEventListener("submit", guardarMesa);
  document.querySelector("#formUsuario")?.addEventListener("submit", crearUsuario);
  document.querySelector("#hora")?.addEventListener("change", sugerirHoraFin);

  document.querySelector("#filtroFecha")?.addEventListener("change", (event) => {
    state.filters.fecha = event.target.value;
  });
  document.querySelector("#filtroHora")?.addEventListener("change", (event) => {
    state.filters.hora = event.target.value;
  });
  document.querySelector("#filtroEstado")?.addEventListener("change", (event) => {
    state.filters.estado = event.target.value;
  });
  document.querySelector("#filtroZona")?.addEventListener("change", (event) => {
    state.filters.zona = event.target.value;
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", manejarAccion);
  });
}

async function login(event) {
  event.preventDefault();
  setMessage("Entrando...");

  try {
    const data = await api("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        email: document.querySelector("#loginEmail").value,
        password: document.querySelector("#loginPassword").value,
      }),
    });

    state.user = data.user;
    state.token = data.access_token;
    localStorage.setItem("user", JSON.stringify(state.user));
    localStorage.setItem("token", state.token);
    renderApp();
    await cargarDatosVista();
  } catch (error) {
    setMessage(error.message, "error");
  }
}

function cerrarSesion(render = true) {
  state.user = null;
  state.token = null;
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  if (render) renderLogin();
}

async function cargarDatosVista() {
  try {
    if (state.activeTab === "reservas") {
      await Promise.all([cargarMesas(false), cargarReservas(false)]);
    } else if (state.activeTab === "calendario") {
      await Promise.all([cargarMesas(false), cargarReservas(false)]);
    } else if (state.activeTab === "dashboard") {
      await cargarDashboard(false);
    } else if (state.activeTab === "mesas") {
      await cargarMesas(false);
    } else if (state.activeTab === "usuarios") {
      await cargarUsuarios(false);
    }
    renderApp();
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function cargarCalendarioDesdeFiltros() {
  state.filters.fecha = document.querySelector("#filtroFecha").value;
  state.filters.estado = "";
  await Promise.all([cargarMesas(false), cargarReservas(false)]);
  renderApp();
}

async function cargarDashboard(render = true) {
  state.stats = await api("/dashboard/stats");
  if (render) renderApp();
}

async function cargarReservasDesdeFiltros() {
  state.filters.fecha = document.querySelector("#filtroFecha").value;
  state.filters.estado = document.querySelector("#filtroEstado").value;
  state.filters.zona = document.querySelector("#filtroZona").value;
  await cargarReservas();
}

async function cargarReservas(render = true) {
  const params = new URLSearchParams();
  if (state.filters.fecha) params.append("fecha", state.filters.fecha);
  if (state.filters.estado) params.append("estado", state.filters.estado);
  if (state.filters.zona) params.append("zona", state.filters.zona);
  state.reservas = await api(`/reservas/?${params.toString()}`);
  if (render) renderApp();
}

async function cargarMesasDesdeFiltros() {
  state.filters.fecha = document.querySelector("#filtroFecha").value;
  state.filters.hora = document.querySelector("#filtroHora").value;
  await cargarMesas();
}

async function cargarMesas(render = true) {
  const params = new URLSearchParams();
  if (state.filters.fecha) params.append("fecha", state.filters.fecha);
  if (state.filters.hora) params.append("hora", state.filters.hora);
  state.mesas = await api(`/dashboard/mesas?${params.toString()}`);
  if (render) renderApp();
}

async function cargarUsuarios(render = true) {
  state.usuarios = await api("/usuarios/");
  if (render) renderApp();
}

async function crearReserva(event) {
  event.preventDefault();
  try {
    await api("/reservas/", {
      method: "POST",
      body: JSON.stringify({
        cliente_nombre: document.querySelector("#nombre").value,
        cliente_telefono: document.querySelector("#telefono").value,
        personas: Number(document.querySelector("#personas").value),
        fecha: document.querySelector("#fecha").value,
        hora: document.querySelector("#hora").value,
        hora_fin: document.querySelector("#horaFin").value,
        zona_preferida: document.querySelector("#zonaPreferida").value,
        observaciones: document.querySelector("#observaciones").value,
      }),
    });
    state.filters.fecha = document.querySelector("#fecha").value;
    await Promise.all([cargarReservas(false), cargarMesas(false)]);
    renderApp();
    setMessage("Reserva creada.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function crearMesa(event) {
  event.preventDefault();
  try {
    await api("/mesas/", {
      method: "POST",
      body: JSON.stringify({
        nombre: document.querySelector("#mesaNombre").value,
        capacidad: Number(document.querySelector("#mesaCapacidad").value),
        zona: document.querySelector("#mesaZona").value,
      }),
    });
    await cargarMesas(false);
    renderApp();
    setMessage("Mesa creada.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function guardarMesa(event) {
  event.preventDefault();
  const mesa = getSelectedMesa();
  if (!mesa) return;

  try {
    await api(`/mesas/${mesa.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        nombre: document.querySelector("#editarMesaNombre").value,
        capacidad: Number(document.querySelector("#editarMesaCapacidad").value),
        zona: document.querySelector("#editarMesaZona").value,
        activa: document.querySelector("#editarMesaActiva").value === "true",
      }),
    });
    state.selectedMesaId = null;
    await cargarMesas(false);
    renderApp();
    setMessage("Mesa actualizada.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function crearUsuario(event) {
  event.preventDefault();
  try {
    await api("/usuarios/", {
      method: "POST",
      body: JSON.stringify({
        nombre: document.querySelector("#usuarioNombre").value,
        email: document.querySelector("#usuarioEmail").value,
        password: document.querySelector("#usuarioPassword").value,
        rol: document.querySelector("#usuarioRol").value,
      }),
    });
    await cargarUsuarios(false);
    renderApp();
    setMessage("Usuario creado.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function manejarAccion(event) {
  const button = event.currentTarget;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  try {
    if (action === "detalle") {
      state.selectedReservaId = id;
      if (!state.mesas.length) await cargarMesas(false);
      renderApp();
      return;
    }

    if (action === "cerrar-detalle") {
      state.selectedReservaId = null;
      renderApp();
      return;
    }

    if (action === "editar-mesa") {
      state.selectedMesaId = id;
      renderApp();
      return;
    }

    if (action === "cerrar-edicion-mesa") {
      state.selectedMesaId = null;
      renderApp();
      return;
    }

    if (action === "confirmar") {
      await api(`/reservas/${id}/confirmar`, { method: "PATCH" });
      state.selectedReservaId = id;
      await Promise.all([cargarReservas(false), cargarMesas(false)]);
    }

    if (action === "cancelar") {
      await api(`/reservas/${id}/cancelar`, { method: "PATCH" });
      state.selectedReservaId = id;
      await Promise.all([cargarReservas(false), cargarMesas(false)]);
    }

    if (action === "asignar") {
      const mesaId = Number(document.querySelector(`[data-mesa-reserva="${id}"]`).value);
      if (!mesaId) throw new Error("Selecciona una mesa");
      await api(`/reservas/${id}/asignar-mesa`, {
        method: "PATCH",
        body: JSON.stringify({ mesa_id: mesaId }),
      });
      state.selectedReservaId = id;
      await Promise.all([cargarReservas(false), cargarMesas(false)]);
    }

    if (action === "toggle-mesa") {
      await api(`/mesas/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ activa: button.dataset.activa !== "true" }),
      });
      await cargarMesas(false);
    }

    if (action === "toggle-usuario") {
      await api(`/usuarios/${id}/toggle`, { method: "PATCH" });
      await cargarUsuarios(false);
    }

    renderApp();
    setMessage("Cambios guardados.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

if (state.user && state.token) {
  renderApp();
  cargarDatosVista();
} else {
  renderLogin();
}

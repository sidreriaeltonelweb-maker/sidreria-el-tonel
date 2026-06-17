const API_URL = "https://sidreria-el-tonel.onrender.com";

let usuarioActual = null;
let token = null;

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

document.querySelector("#app").innerHTML = `
  <div class="container">
    <h1>Sidrería El Tonel</h1>
    <h2>Acceso empleados</h2>

    <form id="formLogin" class="form">
      <input id="loginEmail" placeholder="Email" required />
      <input id="loginPassword" type="password" placeholder="Contraseña" required />
      <button type="submit">Entrar</button>
    </form>

    <div id="panel"></div>
  </div>
`;

document.querySelector("#formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.querySelector("#loginEmail").value,
      password: document.querySelector("#loginPassword").value,
    }),
  });

  if (!response.ok) {
    alert("Usuario o contraseña incorrectos");
    return;
  }

  const data = await response.json();
  usuarioActual = data.user;
  token = data.access_token;

  document.querySelector("#formLogin").style.display = "none";
  renderPanel();
});

function renderPanel() {
  document.querySelector("#panel").innerHTML = `
    <p><strong>Usuario:</strong> ${usuarioActual.nombre}</p>
    <p><strong>Rol:</strong> ${usuarioActual.rol}</p>

    ${
      usuarioActual.rol !== "empleado"
        ? `
      <h2>Nueva reserva</h2>
      <form id="formReserva" class="form">
        <input id="nombre" placeholder="Nombre del cliente" required />
        <input id="telefono" placeholder="Teléfono" required />
        <input id="personas" type="number" placeholder="Personas" required />
        <input id="fecha" type="date" required />
        <input id="hora" type="time" required />
        <input id="observaciones" placeholder="Observaciones" />
        <button type="submit">Crear reserva</button>
      </form>
    `
        : ""
    }

    <h2>Panel de reservas</h2>

    <div class="filters">
      <input id="filtroFecha" type="date" />
      <select id="filtroEstado">
        <option value="">Todos</option>
        <option value="pendiente">Pendientes</option>
        <option value="confirmada">Confirmadas</option>
        <option value="cancelada">Canceladas</option>
      </select>
      <button id="cargarReservas">Cargar reservas</button>
    </div>

    <div id="reservas"></div>

    <h2>Plano de mesas</h2>

  <div class="leyenda">
    <span>🟢 Libre</span>
    <span>🟡 Pendiente</span>
    <span>🔴 Confirmada</span>
    <span>⚫ Inactiva</span>
  </div>

  <button id="cargarMesas">
    Actualizar plano
  </button>

  <div id="mesas" class="mesas-grid"></div>

<button id="cargarMesas">Cargar mesas</button>
<div id="mesas" class="mesas-grid"></div>

    ${
      usuarioActual.rol === "admin"
        ? `
      <h2>Gestión de mesas</h2>
      <form id="formMesa" class="form">
        <input id="mesaNombre" placeholder="Nombre de la mesa" required />
        <input id="mesaCapacidad" type="number" placeholder="Capacidad" required />
        <input id="mesaZona" placeholder="Zona" value="principal" />
        <button type="submit">Crear mesa</button>
      </form>

      <h2>Gestión de usuarios</h2>
      <form id="formUsuario" class="form">
        <input id="usuarioNombre" placeholder="Nombre" required />
        <input id="usuarioEmail" placeholder="Email" required />
        <input id="usuarioPassword" type="password" placeholder="Contraseña" required />
        <select id="usuarioRol">
          <option value="empleado">Empleado</option>
          <option value="encargado">Encargado</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit">Crear usuario</button>
      </form>

      <button id="cargarUsuarios">Cargar usuarios</button>
      <div id="usuarios"></div>
    `
        : ""
    }

    <h2>Calendario diario</h2>
    <div class="filters">
      <input id="calendarioFecha" type="date" />
      <button id="cargarCalendario">Ver día</button>
    </div>
    <div id="calendario" class="calendario"></div>
  `;

  conectarEventosPanel();
}

function conectarEventosPanel() {
  document.querySelector("#cargarReservas").addEventListener("click", cargarReservas);
  document.querySelector("#cargarMesas").addEventListener("click", cargarMesas);
  document.querySelector("#cargarCalendario").addEventListener("click", cargarCalendario);

  const formReserva = document.querySelector("#formReserva");
  if (formReserva) {
    formReserva.addEventListener("submit", crearReserva);
  }

  const formMesa = document.querySelector("#formMesa");
  if (formMesa) {
    formMesa.addEventListener("submit", crearMesa);
  }

  const formUsuario = document.querySelector("#formUsuario");
  if (formUsuario) {
    formUsuario.addEventListener("submit", crearUsuario);
  }

  const cargarUsuariosBtn = document.querySelector("#cargarUsuarios");
  if (cargarUsuariosBtn) {
    cargarUsuariosBtn.addEventListener("click", cargarUsuarios);
  }
}

async function crearReserva(e) {
  e.preventDefault();

  const reserva = {
    cliente_nombre: document.querySelector("#nombre").value,
    cliente_telefono: document.querySelector("#telefono").value,
    personas: Number(document.querySelector("#personas").value),
    fecha: document.querySelector("#fecha").value,
    hora: document.querySelector("#hora").value,
    observaciones: document.querySelector("#observaciones").value,
  };

  const response = await fetch(`${API_URL}/reservas/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(reserva),
  });

  if (!response.ok) {
    alert("No se pudo crear la reserva");
    return;
  }

  e.target.reset();
  await cargarReservas();
  await cargarMesas();
}

async function cargarReservas() {
  const fecha = document.querySelector("#filtroFecha").value;
  const estado = document.querySelector("#filtroEstado").value;

  const params = new URLSearchParams();

  if (fecha) params.append("fecha", fecha);
  if (estado) params.append("estado", estado);

  const response = await fetch(`${API_URL}/reservas/?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    alert("No se pudieron cargar las reservas");
    return;
  }

  const reservas = await response.json();
  const contenedor = document.querySelector("#reservas");

  if (reservas.length === 0) {
    contenedor.innerHTML = "<p>No hay reservas.</p>";
    return;
  }

  contenedor.innerHTML = reservas
    .map(
      (reserva) => `
      <div class="card">
        <h3>${reserva.cliente_nombre}</h3>
        <p><strong>Teléfono:</strong> ${reserva.cliente_telefono}</p>
        <p><strong>Personas:</strong> ${reserva.personas}</p>
        <p><strong>Fecha:</strong> ${reserva.fecha}</p>
        <p><strong>Hora:</strong> ${reserva.hora}</p>
        <p><strong>Estado:</strong> ${reserva.estado}</p>
        <p><strong>Mesa:</strong> ${reserva.mesa_id ?? "Sin asignar"}</p>

        ${
          usuarioActual.rol !== "empleado"
            ? `
          <button onclick="confirmarReserva(${reserva.id})">Confirmar</button>
          <button onclick="cancelarReserva(${reserva.id})" class="danger">Cancelar</button>
        `
            : ""
        }
      </div>
    `
    )
    .join("");
}

async function confirmarReserva(id) {
  const response = await fetch(`${API_URL}/reservas/${id}/confirmar`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  if (!response.ok) {
    alert("No se pudo confirmar la reserva");
    return;
  }

  await cargarReservas();
  await cargarMesas();
}

async function cancelarReserva(id) {
  const response = await fetch(`${API_URL}/reservas/${id}/cancelar`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  if (!response.ok) {
    alert("No se pudo cancelar la reserva");
    return;
  }

  await cargarReservas();
  await cargarMesas();
}

async function cargarMesas() {
  const response = await fetch(`${API_URL}/dashboard/mesas`);

  if (!response.ok) {
    alert("No se pudieron cargar las mesas");
    return;
  }

  const mesas = await response.json();

  document.querySelector("#mesas").innerHTML = mesas
    .map(
      (mesa) => `
      <div class="mesa-card mesa-${mesa.estado}">
        <h3>${mesa.nombre}</h3>
        <p>${mesa.capacidad} personas</p>
        <p>${mesa.estado}</p>

        ${
          usuarioActual.rol === "admin"
            ? `
          <button onclick="desactivarMesa(${mesa.id})" class="danger">
            Desactivar
          </button>
        `
            : ""
        }
      </div>
    `
    )
    .join("");
}

async function crearMesa(e) {
  e.preventDefault();

  const mesa = {
    nombre: document.querySelector("#mesaNombre").value,
    capacidad: Number(document.querySelector("#mesaCapacidad").value),
    zona: document.querySelector("#mesaZona").value,
  };

  const response = await fetch(`${API_URL}/mesas/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(mesa),
  });

  if (!response.ok) {
    alert("No se pudo crear la mesa");
    return;
  }

  e.target.reset();
  await cargarMesas();
}

async function desactivarMesa(id) {
  const response = await fetch(`${API_URL}/mesas/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    alert("No se pudo desactivar la mesa");
    return;
  }

  await cargarMesas();
}

async function cargarCalendario() {
  const fecha = document.querySelector("#calendarioFecha").value;

  if (!fecha) {
    alert("Selecciona una fecha");
    return;
  }

  const response = await fetch(`${API_URL}/reservas/?fecha=${fecha}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    alert("No se pudo cargar el calendario");
    return;
  }

  const reservas = await response.json();
  const contenedor = document.querySelector("#calendario");

  if (reservas.length === 0) {
    contenedor.innerHTML = "<p>No hay reservas para este día.</p>";
    return;
  }

  contenedor.innerHTML = reservas
    .map(
      (reserva) => `
      <div class="calendar-row estado-${reserva.estado}">
        <div><strong>${reserva.hora}</strong></div>
        <div>
          ${reserva.cliente_nombre}<br />
          <small>${reserva.personas} personas · Mesa ${reserva.mesa_id ?? "sin asignar"}</small>
        </div>
        <div>${reserva.estado}</div>
      </div>
    `
    )
    .join("");
}

async function cargarUsuarios() {
  const response = await fetch(`${API_URL}/usuarios/`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    alert("No se pudieron cargar los usuarios");
    return;
  }

  const usuarios = await response.json();

  document.querySelector("#usuarios").innerHTML = usuarios
    .map(
      (usuario) => `
      <div class="card">
        <h3>${usuario.nombre}</h3>
        <p><strong>Email:</strong> ${usuario.email}</p>
        <p><strong>Rol:</strong> ${usuario.rol}</p>
        <p><strong>Activo:</strong> ${usuario.activo ? "Sí" : "No"}</p>

        <button onclick="toggleUsuario(${usuario.id})">
          ${usuario.activo ? "Desactivar" : "Activar"}
        </button>
      </div>
    `
    )
    .join("");
}

async function crearUsuario(e) {
  e.preventDefault();

  const usuario = {
    nombre: document.querySelector("#usuarioNombre").value,
    email: document.querySelector("#usuarioEmail").value,
    password: document.querySelector("#usuarioPassword").value,
    rol: document.querySelector("#usuarioRol").value,
  };

  const response = await fetch(`${API_URL}/usuarios/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(usuario),
  });

  if (!response.ok) {
    alert("No se pudo crear el usuario");
    return;
  }

  e.target.reset();
  await cargarUsuarios();
}

async function toggleUsuario(id) {
  const response = await fetch(`${API_URL}/usuarios/${id}/toggle`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  if (!response.ok) {
    alert("No se pudo cambiar el estado del usuario");
    return;
  }

  await cargarUsuarios();
}

window.desactivarMesa = desactivarMesa;
window.toggleUsuario = toggleUsuario;
window.confirmarReserva = confirmarReserva;
window.cancelarReserva = cancelarReserva;
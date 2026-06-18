(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`localhost`,`127.0.0.1`].includes(window.location.hostname)||/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname)?`http://${[`localhost`,`127.0.0.1`].includes(window.location.hostname)?`127.0.0.1`:window.location.hostname}:8000`:`https://sidreria-el-tonel.onrender.com`,t={user:JSON.parse(localStorage.getItem(`user`)||`null`),token:localStorage.getItem(`token`),activeTab:`dashboard`,reservas:[],mesas:[],usuarios:[],stats:null,selectedReservaId:null,selectedMesaId:null,filters:{fecha:new Date().toISOString().slice(0,10),estado:``,zona:``}},n=document.querySelector(`#app`),r=null;`serviceWorker`in navigator&&window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`/sidreria-el-tonel/app/sw.js`).catch(()=>{})}),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),r=e,m()}),window.addEventListener(`appinstalled`,()=>{r=null,m()});function i(e=``){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function a(){return t.user?.rol===`admin`||t.user?.rol===`encargado`}function o(){return t.user?.rol===`admin`}function s(e=``){return String(e).slice(0,5)}function c(e){return e===`exterior`?`Terraza exterior`:`Comedor interior`}function l(){return t.reservas.find(e=>e.id===t.selectedReservaId)||null}function u(){return t.mesas.find(e=>e.id===t.selectedMesaId)||null}function d(){return{"Content-Type":`application/json`,Authorization:`Bearer ${t.token}`}}async function f(t,n={}){let r=n.auth===!1?{"Content-Type":`application/json`}:d(),i=await fetch(`${e}${t}`,{...n,headers:{...r,...n.headers||{}}});i.status===401&&n.auth!==!1&&R(!1);let a=(i.headers.get(`content-type`)||``).includes(`application/json`)?await i.json():null;if(!i.ok){let e=Array.isArray(a?.detail)?a.detail.map(e=>e.msg).join(`. `):a?.detail;throw Error(e||`No se pudo completar la operación`)}return a}function p(e=``,t=`info`){let n=document.querySelector(`#message`);n&&(n.className=`message ${t}`,n.textContent=e)}function m(){let e=document.querySelector(`#installAppBtn`);e&&(e.hidden=!r)}function h(){n.innerHTML=`
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
  `,document.querySelector(`#formLogin`).addEventListener(`submit`,L)}function g(){n.innerHTML=`
    <div class="app-shell">
      <aside class="sidebar">
        <div>
          <p class="eyebrow">Sidrería El Tonel</p>
          <h1>Reservas</h1>
        </div>
        <nav class="nav-tabs">
          <button class="${t.activeTab===`dashboard`?`active`:``}" data-tab="dashboard">Dashboard</button>
          <button class="${t.activeTab===`reservas`?`active`:``}" data-tab="reservas">Reservas</button>
          <button class="${t.activeTab===`calendario`?`active`:``}" data-tab="calendario">Calendario</button>
          <button class="${t.activeTab===`mesas`?`active`:``}" data-tab="mesas">Mesas</button>
          ${o()?`<button class="${t.activeTab===`usuarios`?`active`:``}" data-tab="usuarios">Usuarios</button>`:``}
        </nav>
        <div class="user-box">
          <strong>${i(t.user.nombre)}</strong>
          <span>${i(t.user.rol)}</span>
          <button id="installAppBtn" class="secondary" ${r?``:`hidden`}>Instalar app</button>
          <small class="install-help">iPhone: Compartir > Añadir a pantalla de inicio</small>
          <button id="logoutBtn" class="secondary">Salir</button>
        </div>
      </aside>
      <main class="workspace">
        <div id="message" class="message"></div>
        ${v()}
        ${k()}
        ${N()}
      </main>
    </div>
  `,document.querySelectorAll(`[data-tab]`).forEach(e=>{e.addEventListener(`click`,()=>{t.activeTab=e.dataset.tab,t.selectedMesaId=null,g(),z()})}),document.querySelector(`#logoutBtn`).addEventListener(`click`,()=>R()),document.querySelector(`#installAppBtn`)?.addEventListener(`click`,_),I()}async function _(){r&&(r.prompt(),await r.userChoice,r=null,m())}function v(){return t.activeTab===`dashboard`?y():t.activeTab===`calendario`?w():t.activeTab===`mesas`?j():t.activeTab===`usuarios`&&o()?P():C()}function y(){let e=t.stats||{reservas_hoy:0,pendientes_hoy:0,confirmadas_hoy:0,canceladas_hoy:0,reservas_semana:0,canceladas_semana:0,ocupacion_hoy:0,proximas_reservas:[]};return`
    <section class="toolbar">
      <div>
        <p class="eyebrow">Vista general</p>
        <h2>Dashboard</h2>
      </div>
      <button id="cargarDashboard">Actualizar</button>
    </section>

    <section class="dashboard-grid">
      ${b(`Pendientes`,e.pendientes_hoy,`warm`)}
      ${b(`Confirmadas`,e.confirmadas_hoy,`good`)}
      ${b(`Hoy`,e.reservas_hoy,`cool`)}
      ${b(`Canceladas`,e.canceladas_hoy,`bad`)}
    </section>

    <section class="dashboard-layout">
      <article class="panel">
        <div class="section-title">
          <h3>Próximas reservas</h3>
          <span>${e.proximas_reservas.length} activas</span>
        </div>
        <div class="list compact-list">
          ${e.proximas_reservas.length?e.proximas_reservas.map(x).join(``):`<p class="empty">No hay próximas reservas pendientes o confirmadas.</p>`}
        </div>
      </article>

      <article class="panel stats-panel">
        <div class="section-title">
          <h3>Estadísticas</h3>
        </div>
        <div class="stats-stack">
          ${S(`Ocupación hoy`,e.ocupacion_hoy,`%`)}
          ${S(`Reservas semana`,e.reservas_semana,``)}
          ${S(`Canceladas semana`,e.canceladas_semana,``)}
        </div>
      </article>
    </section>
  `}function b(e,t,n){return`
    <article class="stat-card ${n}">
      <span>${e}</span>
      <strong>${t}</strong>
      <div class="sparkline" aria-hidden="true"></div>
    </article>
  `}function x(e){return`
    <article class="compact-row">
      <strong>${i(s(e.hora))} · ${i(e.cliente_nombre)}</strong>
      <span>${e.personas} personas · ${c(e.zona_preferida)} · ${i(e.fecha)} · Mesa ${e.mesa_id??`sin asignar`}</span>
      <em class="status ${i(e.estado)}">${i(e.estado)}</em>
    </article>
  `}function S(e,t,n){return`
    <div class="progress-row">
      <div>
        <span>${e}</span>
        <strong>${t}${n}</strong>
      </div>
      <div class="progress-track">
        <div style="width: ${Math.min(n===`%`?Number(t):Number(t)*4,100)}%"></div>
      </div>
    </div>
  `}function C(){return`
    <section class="toolbar">
      <div>
        <p class="eyebrow">Operativa diaria</p>
        <h2>Reservas</h2>
      </div>
      <div class="filters">
        <input id="filtroFecha" type="date" value="${t.filters.fecha}" />
        <select id="filtroEstado">
          <option value="">Todos</option>
          <option value="pendiente" ${t.filters.estado===`pendiente`?`selected`:``}>Pendientes</option>
          <option value="confirmada" ${t.filters.estado===`confirmada`?`selected`:``}>Confirmadas</option>
          <option value="cancelada" ${t.filters.estado===`cancelada`?`selected`:``}>Canceladas</option>
        </select>
        <select id="filtroZona">
          <option value="">Todos los comedores</option>
          <option value="interior" ${t.filters.zona===`interior`?`selected`:``}>Comedor interior</option>
          <option value="exterior" ${t.filters.zona===`exterior`?`selected`:``}>Terraza exterior</option>
        </select>
        <button id="cargarReservas">Actualizar</button>
      </div>
    </section>

    <section class="summary-grid">
      ${E(`Pendientes`,t.reservas.filter(e=>e.estado===`pendiente`).length)}
      ${E(`Confirmadas`,t.reservas.filter(e=>e.estado===`confirmada`).length)}
      ${E(`Interior`,t.reservas.filter(e=>e.estado!==`cancelada`&&e.zona_preferida===`interior`).length)}
      ${E(`Exterior`,t.reservas.filter(e=>e.estado!==`cancelada`&&e.zona_preferida===`exterior`).length)}
    </section>

    ${a()?D():``}

    <section class="panel">
      <div class="section-title">
        <h3>Listado</h3>
        <span>${t.reservas.length} reservas</span>
      </div>
      <div id="reservas" class="list">
        ${t.reservas.length?t.reservas.map(O).join(``):`<p class="empty">No hay reservas para los filtros seleccionados.</p>`}
      </div>
    </section>
  `}function w(){return`
    <section class="toolbar">
      <div>
        <p class="eyebrow">Agenda</p>
        <h2>Calendario diario</h2>
      </div>
      <div class="filters">
        <input id="filtroFecha" type="date" value="${t.filters.fecha}" />
        <button id="cargarCalendario">Actualizar</button>
      </div>
    </section>

    <section class="calendar-board">
      ${[`11:30`,`12:00`,`12:30`,`13:00`,`13:30`,`14:00`,`14:30`,`15:00`,`15:30`,`16:00`,`16:30`,`17:00`,`17:30`,`18:00`,`18:30`,`19:00`,`19:30`,`20:00`,`20:30`,`21:00`,`21:30`,`22:00`,`22:30`,`23:00`].map(e=>T(e)).join(``)}
    </section>
  `}function T(e){let n=t.reservas.filter(t=>s(t.hora)===e);return`
    <article class="calendar-slot ${n.length?`has-items`:``}">
      <time>${e}</time>
      <div>
        ${n.length?n.map(e=>`
              <button class="calendar-item estado-${i(e.estado)}" data-action="detalle" data-id="${e.id}">
                <strong>${i(e.cliente_nombre)}</strong>
                <span>${e.personas} personas · ${c(e.zona_preferida)} · Mesa ${e.mesa_id??`sin asignar`}</span>
              </button>
            `).join(``):`<span class="calendar-empty">Libre</span>`}
      </div>
    </article>
  `}function E(e,t){return`
    <article class="metric">
      <span>${e}</span>
      <strong>${t}</strong>
    </article>
  `}function D(){return`
    <section class="panel">
      <div class="section-title">
        <h3>Nueva reserva</h3>
      </div>
      <form id="formReserva" class="form inline-form">
        <input id="nombre" placeholder="Nombre del cliente" required />
        <input id="telefono" placeholder="Teléfono" required />
        <input id="personas" type="number" min="1" placeholder="Personas" required />
        <input id="fecha" type="date" value="${t.filters.fecha}" required />
        <input id="hora" type="time" min="11:30" max="23:00" required />
        <select id="zonaPreferida" required>
          <option value="interior">Comedor interior</option>
          <option value="exterior">Terraza exterior</option>
        </select>
        <input id="observaciones" placeholder="Observaciones" />
        <button type="submit">Crear</button>
      </form>
    </section>
  `}function O(e){let n=t.mesas.filter(t=>t.activa&&t.zona===e.zona_preferida&&t.capacidad>=e.personas);return`
    <article class="row-card estado-${i(e.estado)}">
      <div>
        <h3>${i(e.cliente_nombre)}</h3>
        <p>${i(e.cliente_telefono)} · ${e.personas} personas</p>
        <p>${i(e.fecha)} · ${i(s(e.hora))} · ${c(e.zona_preferida)} · Mesa ${e.mesa_id??`sin asignar`}</p>
        ${e.observaciones?`<p class="note">${i(e.observaciones)}</p>`:``}
      </div>
      <span class="status ${i(e.estado)}">${i(e.estado)}</span>
      ${a()?`
        <div class="actions">
          <select data-mesa-reserva="${e.id}">
            <option value="">Asignar mesa</option>
            ${n.map(t=>`<option value="${t.id}" ${t.id===e.mesa_id?`selected`:``}>${i(t.nombre)} (${t.capacidad})</option>`).join(``)}
          </select>
          <button data-action="asignar" data-id="${e.id}" class="secondary">Asignar</button>
          <button data-action="detalle" data-id="${e.id}" class="secondary">Ver detalle</button>
          <button data-action="confirmar" data-id="${e.id}">Confirmar</button>
          <button data-action="cancelar" data-id="${e.id}" class="danger">Cancelar</button>
        </div>
      `:``}
    </article>
  `}function k(){let e=l();if(!e)return``;let n=t.mesas.filter(t=>t.activa&&t.zona===e.zona_preferida&&t.capacidad>=e.personas);return`
    <div class="modal-backdrop" role="presentation">
      <section class="reservation-detail" role="dialog" aria-modal="true" aria-labelledby="detalleReservaTitulo">
        <header>
          <button data-action="cerrar-detalle" class="icon-button" aria-label="Cerrar">×</button>
          <div>
            <p class="eyebrow">Reserva #${e.id}</p>
            <h2 id="detalleReservaTitulo">${i(e.cliente_nombre)}</h2>
          </div>
          <span class="status ${i(e.estado)}">${i(e.estado)}</span>
        </header>

        <div class="detail-grid">
          ${A(`Teléfono`,e.cliente_telefono)}
          ${A(`Fecha`,e.fecha)}
          ${A(`Hora`,s(e.hora))}
          ${A(`Personas`,e.personas)}
          ${A(`Comedor`,c(e.zona_preferida))}
          ${A(`Mesa asignada`,e.mesa_id??`Sin asignar`)}
          ${A(`Observaciones`,e.observaciones||`Sin observaciones`)}
        </div>

        ${a()?`
          <div class="detail-actions">
            <select data-mesa-reserva="${e.id}">
              <option value="">Asignar mesa</option>
              ${n.map(t=>`<option value="${t.id}" ${t.id===e.mesa_id?`selected`:``}>${i(t.nombre)} (${t.capacidad})</option>`).join(``)}
            </select>
            <button data-action="asignar" data-id="${e.id}" class="secondary">Asignar mesa</button>
            <button data-action="confirmar" data-id="${e.id}">Confirmar</button>
            <button data-action="cancelar" data-id="${e.id}" class="danger">Cancelar</button>
          </div>
        `:``}
      </section>
    </div>
  `}function A(e,t){return`
    <div class="detail-item">
      <span>${e}</span>
      <strong>${i(t)}</strong>
    </div>
  `}function j(){return`
    <section class="toolbar">
      <div>
        <p class="eyebrow">Sala</p>
        <h2>Plano de mesas</h2>
      </div>
      <div class="filters">
        <input id="filtroFecha" type="date" value="${t.filters.fecha}" />
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
        <span>${t.mesas.filter(e=>e.zona===`interior`).length} mesas</span>
      </div>
      <div class="mesas-grid floor-plan interior-plan">
        ${t.mesas.some(e=>e.zona===`interior`)?t.mesas.filter(e=>e.zona===`interior`).map(M).join(``):`<p class="empty">No hay mesas en el comedor interior.</p>`}
      </div>
    </section>

    <section class="dining-area">
      <div class="section-title">
        <h3>Terraza exterior</h3>
        <span>${t.mesas.filter(e=>e.zona===`exterior`).length} mesas</span>
      </div>
      <div class="mesas-grid floor-plan exterior-plan">
        ${t.mesas.some(e=>e.zona===`exterior`)?t.mesas.filter(e=>e.zona===`exterior`).map(M).join(``):`<p class="empty">No hay mesas en la terraza exterior.</p>`}
      </div>
    </section>

    ${o()?`
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
    `:``}
  `}function M(e){return`
    <article class="mesa-card mesa-${i(e.estado)}">
      <h3>${i(e.nombre)}</h3>
      <p>${e.capacidad} personas · ${c(e.zona)}</p>
      <strong>${i(e.estado)}</strong>
      ${o()?`
        <div class="mesa-actions">
          <button data-action="editar-mesa" data-id="${e.id}" class="secondary">Editar</button>
          <button data-action="toggle-mesa" data-id="${e.id}" data-activa="${e.activa}" class="${e.activa?`danger`:`secondary`}">${e.activa?`Desactivar`:`Activar`}</button>
        </div>
      `:``}
    </article>
  `}function N(){if(!o()||t.activeTab!==`mesas`)return``;let e=u();return e?`
    <div class="modal-backdrop" role="presentation">
      <section class="reservation-detail" role="dialog" aria-modal="true" aria-labelledby="editarMesaTitulo">
        <header>
          <button type="button" data-action="cerrar-edicion-mesa" class="icon-button" aria-label="Cerrar">×</button>
          <div>
            <p class="eyebrow">Mesa #${e.id}</p>
            <h2 id="editarMesaTitulo">Editar mesa</h2>
          </div>
          <span class="status ${e.activa?`confirmada`:`cancelada`}">${e.activa?`Activa`:`Inactiva`}</span>
        </header>
        <form id="editarMesaForm" class="form edit-table-form">
          <label>
            Nombre
            <input id="editarMesaNombre" value="${i(e.nombre)}" required />
          </label>
          <label>
            Capacidad
            <input id="editarMesaCapacidad" type="number" min="1" value="${e.capacidad}" required />
          </label>
          <label>
            Comedor
            <select id="editarMesaZona" required>
              <option value="interior" ${e.zona===`interior`?`selected`:``}>Comedor interior</option>
              <option value="exterior" ${e.zona===`exterior`?`selected`:``}>Terraza exterior</option>
            </select>
          </label>
          <label>
            Estado
            <select id="editarMesaActiva" required>
              <option value="true" ${e.activa?`selected`:``}>Activa</option>
              <option value="false" ${e.activa?``:`selected`}>Inactiva</option>
            </select>
          </label>
          <div class="detail-actions">
            <button type="button" data-action="cerrar-edicion-mesa" class="secondary">Cancelar</button>
            <button type="submit">Guardar cambios</button>
          </div>
        </form>
      </section>
    </div>
  `:``}function P(){return`
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
      ${t.usuarios.length?t.usuarios.map(F).join(``):`<p class="empty">No hay usuarios cargados.</p>`}
    </section>
  `}function F(e){return`
    <article class="row-card">
      <div>
        <h3>${i(e.nombre)}</h3>
        <p>${i(e.email)} · ${i(e.rol)}</p>
      </div>
      <span class="status ${e.activo?`confirmada`:`cancelada`}">${e.activo?`Activo`:`Inactivo`}</span>
      <button data-action="toggle-usuario" data-id="${e.id}" class="secondary" ${e.id===t.user.id?`disabled`:``}>
        ${e.activo?`Desactivar`:`Activar`}
      </button>
    </article>
  `}function I(){document.querySelector(`#cargarReservas`)?.addEventListener(`click`,H),document.querySelector(`#cargarMesas`)?.addEventListener(`click`,W),document.querySelector(`#cargarUsuarios`)?.addEventListener(`click`,K),document.querySelector(`#cargarDashboard`)?.addEventListener(`click`,V),document.querySelector(`#cargarCalendario`)?.addEventListener(`click`,B),document.querySelector(`#formReserva`)?.addEventListener(`submit`,q),document.querySelector(`#formMesa`)?.addEventListener(`submit`,J),document.querySelector(`#editarMesaForm`)?.addEventListener(`submit`,Y),document.querySelector(`#formUsuario`)?.addEventListener(`submit`,X),document.querySelector(`#filtroFecha`)?.addEventListener(`change`,e=>{t.filters.fecha=e.target.value}),document.querySelector(`#filtroEstado`)?.addEventListener(`change`,e=>{t.filters.estado=e.target.value}),document.querySelector(`#filtroZona`)?.addEventListener(`change`,e=>{t.filters.zona=e.target.value}),document.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,Z)})}async function L(e){e.preventDefault(),p(`Entrando...`);try{let e=await f(`/auth/login`,{method:`POST`,auth:!1,body:JSON.stringify({email:document.querySelector(`#loginEmail`).value,password:document.querySelector(`#loginPassword`).value})});t.user=e.user,t.token=e.access_token,localStorage.setItem(`user`,JSON.stringify(t.user)),localStorage.setItem(`token`,t.token),g(),await z()}catch(e){p(e.message,`error`)}}function R(e=!0){t.user=null,t.token=null,localStorage.removeItem(`user`),localStorage.removeItem(`token`),e&&h()}async function z(){try{t.activeTab===`reservas`||t.activeTab===`calendario`?await Promise.all([G(!1),U(!1)]):t.activeTab===`dashboard`?await V(!1):t.activeTab===`mesas`?await G(!1):t.activeTab===`usuarios`&&await K(!1),g()}catch(e){p(e.message,`error`)}}async function B(){t.filters.fecha=document.querySelector(`#filtroFecha`).value,t.filters.estado=``,await Promise.all([G(!1),U(!1)]),g()}async function V(e=!0){t.stats=await f(`/dashboard/stats`),e&&g()}async function H(){t.filters.fecha=document.querySelector(`#filtroFecha`).value,t.filters.estado=document.querySelector(`#filtroEstado`).value,t.filters.zona=document.querySelector(`#filtroZona`).value,await U()}async function U(e=!0){let n=new URLSearchParams;t.filters.fecha&&n.append(`fecha`,t.filters.fecha),t.filters.estado&&n.append(`estado`,t.filters.estado),t.filters.zona&&n.append(`zona`,t.filters.zona),t.reservas=await f(`/reservas/?${n.toString()}`),e&&g()}async function W(){t.filters.fecha=document.querySelector(`#filtroFecha`).value,await G()}async function G(e=!0){let n=new URLSearchParams;t.filters.fecha&&n.append(`fecha`,t.filters.fecha),t.mesas=await f(`/dashboard/mesas?${n.toString()}`),e&&g()}async function K(e=!0){t.usuarios=await f(`/usuarios/`),e&&g()}async function q(e){e.preventDefault();try{await f(`/reservas/`,{method:`POST`,body:JSON.stringify({cliente_nombre:document.querySelector(`#nombre`).value,cliente_telefono:document.querySelector(`#telefono`).value,personas:Number(document.querySelector(`#personas`).value),fecha:document.querySelector(`#fecha`).value,hora:document.querySelector(`#hora`).value,zona_preferida:document.querySelector(`#zonaPreferida`).value,observaciones:document.querySelector(`#observaciones`).value})}),t.filters.fecha=document.querySelector(`#fecha`).value,await Promise.all([U(!1),G(!1)]),g(),p(`Reserva creada.`,`success`)}catch(e){p(e.message,`error`)}}async function J(e){e.preventDefault();try{await f(`/mesas/`,{method:`POST`,body:JSON.stringify({nombre:document.querySelector(`#mesaNombre`).value,capacidad:Number(document.querySelector(`#mesaCapacidad`).value),zona:document.querySelector(`#mesaZona`).value})}),await G(!1),g(),p(`Mesa creada.`,`success`)}catch(e){p(e.message,`error`)}}async function Y(e){e.preventDefault();let n=u();if(n)try{await f(`/mesas/${n.id}`,{method:`PATCH`,body:JSON.stringify({nombre:document.querySelector(`#editarMesaNombre`).value,capacidad:Number(document.querySelector(`#editarMesaCapacidad`).value),zona:document.querySelector(`#editarMesaZona`).value,activa:document.querySelector(`#editarMesaActiva`).value===`true`})}),t.selectedMesaId=null,await G(!1),g(),p(`Mesa actualizada.`,`success`)}catch(e){p(e.message,`error`)}}async function X(e){e.preventDefault();try{await f(`/usuarios/`,{method:`POST`,body:JSON.stringify({nombre:document.querySelector(`#usuarioNombre`).value,email:document.querySelector(`#usuarioEmail`).value,password:document.querySelector(`#usuarioPassword`).value,rol:document.querySelector(`#usuarioRol`).value})}),await K(!1),g(),p(`Usuario creado.`,`success`)}catch(e){p(e.message,`error`)}}async function Z(e){let n=e.currentTarget,r=Number(n.dataset.id),i=n.dataset.action;try{if(i===`detalle`){t.selectedReservaId=r,t.mesas.length||await G(!1),g();return}if(i===`cerrar-detalle`){t.selectedReservaId=null,g();return}if(i===`editar-mesa`){t.selectedMesaId=r,g();return}if(i===`cerrar-edicion-mesa`){t.selectedMesaId=null,g();return}if(i===`confirmar`&&(await f(`/reservas/${r}/confirmar`,{method:`PATCH`}),t.selectedReservaId=r,await Promise.all([U(!1),G(!1)])),i===`cancelar`&&(await f(`/reservas/${r}/cancelar`,{method:`PATCH`}),t.selectedReservaId=r,await Promise.all([U(!1),G(!1)])),i===`asignar`){let e=Number(document.querySelector(`[data-mesa-reserva="${r}"]`).value);if(!e)throw Error(`Selecciona una mesa`);await f(`/reservas/${r}/asignar-mesa`,{method:`PATCH`,body:JSON.stringify({mesa_id:e})}),t.selectedReservaId=r,await Promise.all([U(!1),G(!1)])}i===`toggle-mesa`&&(await f(`/mesas/${r}`,{method:`PATCH`,body:JSON.stringify({activa:n.dataset.activa!==`true`})}),await G(!1)),i===`toggle-usuario`&&(await f(`/usuarios/${r}/toggle`,{method:`PATCH`}),await K(!1)),g(),p(`Cambios guardados.`,`success`)}catch(e){p(e.message,`error`)}}t.user&&t.token?(g(),z()):h();
(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`localhost`,`127.0.0.1`].includes(window.location.hostname)||/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname)?`http://${[`localhost`,`127.0.0.1`].includes(window.location.hostname)?`127.0.0.1`:window.location.hostname}:8000`:`https://sidreria-el-tonel.onrender.com`,t={user:JSON.parse(localStorage.getItem(`user`)||`null`),token:localStorage.getItem(`token`),activeTab:`dashboard`,reservas:[],mesas:[],usuarios:[],stats:null,selectedReservaId:null,filters:{fecha:new Date().toISOString().slice(0,10),estado:``}},n=document.querySelector(`#app`),r=null;`serviceWorker`in navigator&&window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`/sidreria-el-tonel/app/sw.js`).catch(()=>{})}),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),r=e,f()}),window.addEventListener(`appinstalled`,()=>{r=null,f()});function i(e=``){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function a(){return t.user?.rol===`admin`||t.user?.rol===`encargado`}function o(){return t.user?.rol===`admin`}function s(e=``){return String(e).slice(0,5)}function c(){return t.reservas.find(e=>e.id===t.selectedReservaId)||null}function l(){return{"Content-Type":`application/json`,Authorization:`Bearer ${t.token}`}}async function u(t,n={}){let r=n.auth===!1?{"Content-Type":`application/json`}:l(),i=await fetch(`${e}${t}`,{...n,headers:{...r,...n.headers||{}}});i.status===401&&n.auth!==!1&&F(!1);let a=(i.headers.get(`content-type`)||``).includes(`application/json`)?await i.json():null;if(!i.ok){let e=Array.isArray(a?.detail)?a.detail.map(e=>e.msg).join(`. `):a?.detail;throw Error(e||`No se pudo completar la operación`)}return a}function d(e=``,t=`info`){let n=document.querySelector(`#message`);n&&(n.className=`message ${t}`,n.textContent=e)}function f(){let e=document.querySelector(`#installAppBtn`);e&&(e.hidden=!r)}function p(){n.innerHTML=`
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
  `,document.querySelector(`#formLogin`).addEventListener(`submit`,P)}function m(){n.innerHTML=`
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
        ${g()}
        ${D()}
      </main>
    </div>
  `,document.querySelectorAll(`[data-tab]`).forEach(e=>{e.addEventListener(`click`,()=>{t.activeTab=e.dataset.tab,m(),I()})}),document.querySelector(`#logoutBtn`).addEventListener(`click`,()=>F()),document.querySelector(`#installAppBtn`)?.addEventListener(`click`,h),N()}async function h(){r&&(r.prompt(),await r.userChoice,r=null,f())}function g(){return t.activeTab===`dashboard`?_():t.activeTab===`calendario`?S():t.activeTab===`mesas`?k():t.activeTab===`usuarios`&&o()?j():x()}function _(){let e=t.stats||{reservas_hoy:0,pendientes_hoy:0,confirmadas_hoy:0,canceladas_hoy:0,reservas_semana:0,canceladas_semana:0,ocupacion_hoy:0,proximas_reservas:[]};return`
    <section class="toolbar">
      <div>
        <p class="eyebrow">Vista general</p>
        <h2>Dashboard</h2>
      </div>
      <button id="cargarDashboard">Actualizar</button>
    </section>

    <section class="dashboard-grid">
      ${v(`Pendientes`,e.pendientes_hoy,`warm`)}
      ${v(`Confirmadas`,e.confirmadas_hoy,`good`)}
      ${v(`Hoy`,e.reservas_hoy,`cool`)}
      ${v(`Canceladas`,e.canceladas_hoy,`bad`)}
    </section>

    <section class="dashboard-layout">
      <article class="panel">
        <div class="section-title">
          <h3>Próximas reservas</h3>
          <span>${e.proximas_reservas.length} activas</span>
        </div>
        <div class="list compact-list">
          ${e.proximas_reservas.length?e.proximas_reservas.map(y).join(``):`<p class="empty">No hay próximas reservas pendientes o confirmadas.</p>`}
        </div>
      </article>

      <article class="panel stats-panel">
        <div class="section-title">
          <h3>Estadísticas</h3>
        </div>
        <div class="stats-stack">
          ${b(`Ocupación hoy`,e.ocupacion_hoy,`%`)}
          ${b(`Reservas semana`,e.reservas_semana,``)}
          ${b(`Canceladas semana`,e.canceladas_semana,``)}
        </div>
      </article>
    </section>
  `}function v(e,t,n){return`
    <article class="stat-card ${n}">
      <span>${e}</span>
      <strong>${t}</strong>
      <div class="sparkline" aria-hidden="true"></div>
    </article>
  `}function y(e){return`
    <article class="compact-row">
      <strong>${i(s(e.hora))} · ${i(e.cliente_nombre)}</strong>
      <span>${e.personas} personas · ${i(e.fecha)} · Mesa ${e.mesa_id??`sin asignar`}</span>
      <em class="status ${i(e.estado)}">${i(e.estado)}</em>
    </article>
  `}function b(e,t,n){return`
    <div class="progress-row">
      <div>
        <span>${e}</span>
        <strong>${t}${n}</strong>
      </div>
      <div class="progress-track">
        <div style="width: ${Math.min(n===`%`?Number(t):Number(t)*4,100)}%"></div>
      </div>
    </div>
  `}function x(){return`
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
        <button id="cargarReservas">Actualizar</button>
      </div>
    </section>

    <section class="summary-grid">
      ${w(`Pendientes`,t.reservas.filter(e=>e.estado===`pendiente`).length)}
      ${w(`Confirmadas`,t.reservas.filter(e=>e.estado===`confirmada`).length)}
      ${w(`Comensales`,t.reservas.reduce((e,t)=>t.estado===`cancelada`?e:e+t.personas,0))}
    </section>

    ${a()?T():``}

    <section class="panel">
      <div class="section-title">
        <h3>Listado</h3>
        <span>${t.reservas.length} reservas</span>
      </div>
      <div id="reservas" class="list">
        ${t.reservas.length?t.reservas.map(E).join(``):`<p class="empty">No hay reservas para los filtros seleccionados.</p>`}
      </div>
    </section>
  `}function S(){return`
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
      ${[`11:30`,`12:00`,`12:30`,`13:00`,`13:30`,`14:00`,`14:30`,`15:00`,`15:30`,`16:00`,`16:30`,`17:00`,`17:30`,`18:00`,`18:30`,`19:00`,`19:30`,`20:00`,`20:30`,`21:00`,`21:30`,`22:00`,`22:30`,`23:00`].map(e=>C(e)).join(``)}
    </section>
  `}function C(e){let n=t.reservas.filter(t=>s(t.hora)===e);return`
    <article class="calendar-slot ${n.length?`has-items`:``}">
      <time>${e}</time>
      <div>
        ${n.length?n.map(e=>`
              <button class="calendar-item estado-${i(e.estado)}" data-action="detalle" data-id="${e.id}">
                <strong>${i(e.cliente_nombre)}</strong>
                <span>${e.personas} personas · Mesa ${e.mesa_id??`sin asignar`}</span>
              </button>
            `).join(``):`<span class="calendar-empty">Libre</span>`}
      </div>
    </article>
  `}function w(e,t){return`
    <article class="metric">
      <span>${e}</span>
      <strong>${t}</strong>
    </article>
  `}function T(){return`
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
        <input id="observaciones" placeholder="Observaciones" />
        <button type="submit">Crear</button>
      </form>
    </section>
  `}function E(e){let n=t.mesas.filter(t=>t.activa&&t.capacidad>=e.personas);return`
    <article class="row-card estado-${i(e.estado)}">
      <div>
        <h3>${i(e.cliente_nombre)}</h3>
        <p>${i(e.cliente_telefono)} · ${e.personas} personas</p>
        <p>${i(e.fecha)} · ${i(s(e.hora))} · Mesa ${e.mesa_id??`sin asignar`}</p>
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
  `}function D(){let e=c();if(!e)return``;let n=t.mesas.filter(t=>t.activa&&t.capacidad>=e.personas);return`
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
          ${O(`Teléfono`,e.cliente_telefono)}
          ${O(`Fecha`,e.fecha)}
          ${O(`Hora`,s(e.hora))}
          ${O(`Personas`,e.personas)}
          ${O(`Mesa asignada`,e.mesa_id??`Sin asignar`)}
          ${O(`Observaciones`,e.observaciones||`Sin observaciones`)}
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
  `}function O(e,t){return`
    <div class="detail-item">
      <span>${e}</span>
      <strong>${i(t)}</strong>
    </div>
  `}function k(){return`
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

    <section class="mesas-grid floor-plan">
      ${t.mesas.length?t.mesas.map(A).join(``):`<p class="empty">No hay mesas cargadas.</p>`}
    </section>

    ${o()?`
      <section class="panel">
        <div class="section-title">
          <h3>Crear mesa</h3>
        </div>
        <form id="formMesa" class="form inline-form">
          <input id="mesaNombre" placeholder="Nombre de la mesa" required />
          <input id="mesaCapacidad" type="number" min="1" placeholder="Capacidad" required />
          <input id="mesaZona" placeholder="Zona" value="principal" required />
          <button type="submit">Crear</button>
        </form>
      </section>
    `:``}
  `}function A(e){return`
    <article class="mesa-card mesa-${i(e.estado)}">
      <h3>${i(e.nombre)}</h3>
      <p>${e.capacidad} personas</p>
      <strong>${i(e.estado)}</strong>
      ${o()?`<button data-action="toggle-mesa" data-id="${e.id}" data-activa="${e.activa}" class="${e.activa?`danger`:`secondary`}">${e.activa?`Desactivar`:`Activar`}</button>`:``}
    </article>
  `}function j(){return`
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
      ${t.usuarios.length?t.usuarios.map(M).join(``):`<p class="empty">No hay usuarios cargados.</p>`}
    </section>
  `}function M(e){return`
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
  `}function N(){document.querySelector(`#cargarReservas`)?.addEventListener(`click`,z),document.querySelector(`#cargarMesas`)?.addEventListener(`click`,V),document.querySelector(`#cargarUsuarios`)?.addEventListener(`click`,U),document.querySelector(`#cargarDashboard`)?.addEventListener(`click`,R),document.querySelector(`#cargarCalendario`)?.addEventListener(`click`,L),document.querySelector(`#formReserva`)?.addEventListener(`submit`,W),document.querySelector(`#formMesa`)?.addEventListener(`submit`,G),document.querySelector(`#formUsuario`)?.addEventListener(`submit`,K),document.querySelector(`#filtroFecha`)?.addEventListener(`change`,e=>{t.filters.fecha=e.target.value}),document.querySelector(`#filtroEstado`)?.addEventListener(`change`,e=>{t.filters.estado=e.target.value}),document.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,q)})}async function P(e){e.preventDefault(),d(`Entrando...`);try{let e=await u(`/auth/login`,{method:`POST`,auth:!1,body:JSON.stringify({email:document.querySelector(`#loginEmail`).value,password:document.querySelector(`#loginPassword`).value})});t.user=e.user,t.token=e.access_token,localStorage.setItem(`user`,JSON.stringify(t.user)),localStorage.setItem(`token`,t.token),m(),await I()}catch(e){d(e.message,`error`)}}function F(e=!0){t.user=null,t.token=null,localStorage.removeItem(`user`),localStorage.removeItem(`token`),e&&p()}async function I(){try{t.activeTab===`reservas`||t.activeTab===`calendario`?await Promise.all([H(!1),B(!1)]):t.activeTab===`dashboard`?await R(!1):t.activeTab===`mesas`?await H(!1):t.activeTab===`usuarios`&&await U(!1),m()}catch(e){d(e.message,`error`)}}async function L(){t.filters.fecha=document.querySelector(`#filtroFecha`).value,t.filters.estado=``,await Promise.all([H(!1),B(!1)]),m()}async function R(e=!0){t.stats=await u(`/dashboard/stats`),e&&m()}async function z(){t.filters.fecha=document.querySelector(`#filtroFecha`).value,t.filters.estado=document.querySelector(`#filtroEstado`).value,await B()}async function B(e=!0){let n=new URLSearchParams;t.filters.fecha&&n.append(`fecha`,t.filters.fecha),t.filters.estado&&n.append(`estado`,t.filters.estado),t.reservas=await u(`/reservas/?${n.toString()}`),e&&m()}async function V(){t.filters.fecha=document.querySelector(`#filtroFecha`).value,await H()}async function H(e=!0){let n=new URLSearchParams;t.filters.fecha&&n.append(`fecha`,t.filters.fecha),t.mesas=await u(`/dashboard/mesas?${n.toString()}`),e&&m()}async function U(e=!0){t.usuarios=await u(`/usuarios/`),e&&m()}async function W(e){e.preventDefault();try{await u(`/reservas/`,{method:`POST`,body:JSON.stringify({cliente_nombre:document.querySelector(`#nombre`).value,cliente_telefono:document.querySelector(`#telefono`).value,personas:Number(document.querySelector(`#personas`).value),fecha:document.querySelector(`#fecha`).value,hora:document.querySelector(`#hora`).value,observaciones:document.querySelector(`#observaciones`).value})}),t.filters.fecha=document.querySelector(`#fecha`).value,await Promise.all([B(!1),H(!1)]),m(),d(`Reserva creada.`,`success`)}catch(e){d(e.message,`error`)}}async function G(e){e.preventDefault();try{await u(`/mesas/`,{method:`POST`,body:JSON.stringify({nombre:document.querySelector(`#mesaNombre`).value,capacidad:Number(document.querySelector(`#mesaCapacidad`).value),zona:document.querySelector(`#mesaZona`).value})}),await H(!1),m(),d(`Mesa creada.`,`success`)}catch(e){d(e.message,`error`)}}async function K(e){e.preventDefault();try{await u(`/usuarios/`,{method:`POST`,body:JSON.stringify({nombre:document.querySelector(`#usuarioNombre`).value,email:document.querySelector(`#usuarioEmail`).value,password:document.querySelector(`#usuarioPassword`).value,rol:document.querySelector(`#usuarioRol`).value})}),await U(!1),m(),d(`Usuario creado.`,`success`)}catch(e){d(e.message,`error`)}}async function q(e){let n=e.currentTarget,r=Number(n.dataset.id),i=n.dataset.action;try{if(i===`detalle`){t.selectedReservaId=r,t.mesas.length||await H(!1),m();return}if(i===`cerrar-detalle`){t.selectedReservaId=null,m();return}if(i===`confirmar`&&(await u(`/reservas/${r}/confirmar`,{method:`PATCH`}),t.selectedReservaId=r,await Promise.all([B(!1),H(!1)])),i===`cancelar`&&(await u(`/reservas/${r}/cancelar`,{method:`PATCH`}),t.selectedReservaId=r,await Promise.all([B(!1),H(!1)])),i===`asignar`){let e=Number(document.querySelector(`[data-mesa-reserva="${r}"]`).value);if(!e)throw Error(`Selecciona una mesa`);await u(`/reservas/${r}/asignar-mesa`,{method:`PATCH`,body:JSON.stringify({mesa_id:e})}),t.selectedReservaId=r,await Promise.all([B(!1),H(!1)])}i===`toggle-mesa`&&(await u(`/mesas/${r}`,{method:`PATCH`,body:JSON.stringify({activa:n.dataset.activa!==`true`})}),await H(!1)),i===`toggle-usuario`&&(await u(`/usuarios/${r}/toggle`,{method:`PATCH`}),await U(!1)),m(),d(`Cambios guardados.`,`success`)}catch(e){d(e.message,`error`)}}t.user&&t.token?(m(),I()):p();
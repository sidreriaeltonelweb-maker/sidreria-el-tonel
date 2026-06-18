(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`localhost`,`127.0.0.1`].includes(window.location.hostname)||/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname)?`http://${[`localhost`,`127.0.0.1`].includes(window.location.hostname)?`127.0.0.1`:window.location.hostname}:8000`:`https://sidreria-el-tonel.onrender.com`,t=new Date().toTimeString().slice(0,5),n={user:JSON.parse(localStorage.getItem(`user`)||`null`),token:localStorage.getItem(`token`),activeTab:`dashboard`,reservas:[],mesas:[],usuarios:[],stats:null,selectedReservaId:null,selectedMesaId:null,filters:{fecha:new Date().toISOString().slice(0,10),hora:t>=`11:30`&&t<=`23:00`?t:`11:30`,estado:``,zona:``}},r=document.querySelector(`#app`),i=null;`serviceWorker`in navigator&&window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`/sidreria-el-tonel/app/sw.js`).catch(()=>{})}),window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),i=e,g()}),window.addEventListener(`appinstalled`,()=>{i=null,g()});function a(e=``){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function o(){return n.user?.rol===`admin`||n.user?.rol===`encargado`}function s(){return n.user?.rol===`admin`}function c(e=``){return String(e).slice(0,5)}function l(e){return e===`exterior`?`Terraza exterior`:`Comedor interior`}function u(){let e=document.querySelector(`#hora`),t=document.querySelector(`#horaFin`);if(!e?.value||!t)return;let[n,r]=e.value.split(`:`).map(Number),i=Math.min(n*60+r+120,1380);t.value=`${String(Math.floor(i/60)).padStart(2,`0`)}:${String(i%60).padStart(2,`0`)}`,t.min=e.value}function d(){return n.reservas.find(e=>e.id===n.selectedReservaId)||null}function f(){return n.mesas.find(e=>e.id===n.selectedMesaId)||null}function p(){return{"Content-Type":`application/json`,Authorization:`Bearer ${n.token}`}}async function m(t,n={}){let r=n.auth===!1?{"Content-Type":`application/json`}:p(),i=await fetch(`${e}${t}`,{...n,headers:{...r,...n.headers||{}}});i.status===401&&n.auth!==!1&&B(!1);let a=(i.headers.get(`content-type`)||``).includes(`application/json`)?await i.json():null;if(!i.ok){let e=Array.isArray(a?.detail)?a.detail.map(e=>e.msg).join(`. `):a?.detail;throw Error(e||`No se pudo completar la operación`)}return a}function h(e=``,t=`info`){let n=document.querySelector(`#message`);n&&(n.className=`message ${t}`,n.textContent=e)}function g(){let e=document.querySelector(`#installAppBtn`);e&&(e.hidden=!i)}function _(){r.innerHTML=`
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
  `,document.querySelector(`#formLogin`).addEventListener(`submit`,z)}function v(){r.innerHTML=`
    <div class="app-shell">
      <aside class="sidebar">
        <div>
          <p class="eyebrow">Sidrería El Tonel</p>
          <h1>Reservas</h1>
        </div>
        <nav class="nav-tabs">
          <button class="${n.activeTab===`dashboard`?`active`:``}" data-tab="dashboard">Dashboard</button>
          <button class="${n.activeTab===`reservas`?`active`:``}" data-tab="reservas">Reservas</button>
          <button class="${n.activeTab===`calendario`?`active`:``}" data-tab="calendario">Calendario</button>
          <button class="${n.activeTab===`mesas`?`active`:``}" data-tab="mesas">Mesas</button>
          ${s()?`<button class="${n.activeTab===`usuarios`?`active`:``}" data-tab="usuarios">Usuarios</button>`:``}
        </nav>
        <div class="user-box">
          <strong>${a(n.user.nombre)}</strong>
          <span>${a(n.user.rol)}</span>
          <button id="installAppBtn" class="secondary" ${i?``:`hidden`}>Instalar app</button>
          <small class="install-help">iPhone: Compartir > Añadir a pantalla de inicio</small>
          <button id="logoutBtn" class="secondary">Salir</button>
        </div>
      </aside>
      <main class="workspace">
        <div id="message" class="message"></div>
        ${b()}
        ${j()}
        ${F()}
      </main>
    </div>
  `,document.querySelectorAll(`[data-tab]`).forEach(e=>{e.addEventListener(`click`,()=>{n.activeTab=e.dataset.tab,n.selectedMesaId=null,v(),V()})}),document.querySelector(`#logoutBtn`).addEventListener(`click`,()=>B()),document.querySelector(`#installAppBtn`)?.addEventListener(`click`,y),R()}async function y(){i&&(i.prompt(),await i.userChoice,i=null,g())}function b(){return n.activeTab===`dashboard`?x():n.activeTab===`calendario`?E():n.activeTab===`mesas`?N():n.activeTab===`usuarios`&&s()?I():T()}function x(){let e=n.stats||{reservas_hoy:0,pendientes_hoy:0,confirmadas_hoy:0,canceladas_hoy:0,reservas_semana:0,canceladas_semana:0,ocupacion_hoy:0,proximas_reservas:[]};return`
    <section class="toolbar">
      <div>
        <p class="eyebrow">Vista general</p>
        <h2>Dashboard</h2>
      </div>
      <button id="cargarDashboard">Actualizar</button>
    </section>

    <section class="dashboard-grid">
      ${S(`Pendientes`,e.pendientes_hoy,`warm`)}
      ${S(`Confirmadas`,e.confirmadas_hoy,`good`)}
      ${S(`Hoy`,e.reservas_hoy,`cool`)}
      ${S(`Canceladas`,e.canceladas_hoy,`bad`)}
    </section>

    <section class="dashboard-layout">
      <article class="panel">
        <div class="section-title">
          <h3>Próximas reservas</h3>
          <span>${e.proximas_reservas.length} activas</span>
        </div>
        <div class="list compact-list">
          ${e.proximas_reservas.length?e.proximas_reservas.map(C).join(``):`<p class="empty">No hay próximas reservas pendientes o confirmadas.</p>`}
        </div>
      </article>

      <article class="panel stats-panel">
        <div class="section-title">
          <h3>Estadísticas</h3>
        </div>
        <div class="stats-stack">
          ${w(`Ocupación hoy`,e.ocupacion_hoy,`%`)}
          ${w(`Reservas semana`,e.reservas_semana,``)}
          ${w(`Canceladas semana`,e.canceladas_semana,``)}
        </div>
      </article>
    </section>
  `}function S(e,t,n){return`
    <article class="stat-card ${n}">
      <span>${e}</span>
      <strong>${t}</strong>
      <div class="sparkline" aria-hidden="true"></div>
    </article>
  `}function C(e){return`
    <article class="compact-row">
      <strong>${a(c(e.hora))}–${a(c(e.hora_fin))} · ${a(e.cliente_nombre)}</strong>
      <span>${e.personas} personas · ${l(e.zona_preferida)} · ${a(e.fecha)} · Mesa ${e.mesa_id??`sin asignar`}</span>
      <em class="status ${a(e.estado)}">${a(e.estado)}</em>
    </article>
  `}function w(e,t,n){return`
    <div class="progress-row">
      <div>
        <span>${e}</span>
        <strong>${t}${n}</strong>
      </div>
      <div class="progress-track">
        <div style="width: ${Math.min(n===`%`?Number(t):Number(t)*4,100)}%"></div>
      </div>
    </div>
  `}function T(){return`
    <section class="toolbar">
      <div>
        <p class="eyebrow">Operativa diaria</p>
        <h2>Reservas</h2>
      </div>
      <div class="filters">
        <input id="filtroFecha" type="date" value="${n.filters.fecha}" />
        <select id="filtroEstado">
          <option value="">Todos</option>
          <option value="pendiente" ${n.filters.estado===`pendiente`?`selected`:``}>Pendientes</option>
          <option value="confirmada" ${n.filters.estado===`confirmada`?`selected`:``}>Confirmadas</option>
          <option value="cancelada" ${n.filters.estado===`cancelada`?`selected`:``}>Canceladas</option>
        </select>
        <select id="filtroZona">
          <option value="">Todos los comedores</option>
          <option value="interior" ${n.filters.zona===`interior`?`selected`:``}>Comedor interior</option>
          <option value="exterior" ${n.filters.zona===`exterior`?`selected`:``}>Terraza exterior</option>
        </select>
        <button id="cargarReservas">Actualizar</button>
      </div>
    </section>

    <section class="summary-grid">
      ${O(`Pendientes`,n.reservas.filter(e=>e.estado===`pendiente`).length)}
      ${O(`Confirmadas`,n.reservas.filter(e=>e.estado===`confirmada`).length)}
      ${O(`Interior`,n.reservas.filter(e=>e.estado!==`cancelada`&&e.zona_preferida===`interior`).length)}
      ${O(`Exterior`,n.reservas.filter(e=>e.estado!==`cancelada`&&e.zona_preferida===`exterior`).length)}
    </section>

    ${o()?k():``}

    <section class="panel">
      <div class="section-title">
        <h3>Listado</h3>
        <span>${n.reservas.length} reservas</span>
      </div>
      <div id="reservas" class="list">
        ${n.reservas.length?n.reservas.map(A).join(``):`<p class="empty">No hay reservas para los filtros seleccionados.</p>`}
      </div>
    </section>
  `}function E(){return`
    <section class="toolbar">
      <div>
        <p class="eyebrow">Agenda</p>
        <h2>Calendario diario</h2>
      </div>
      <div class="filters">
        <input id="filtroFecha" type="date" value="${n.filters.fecha}" />
        <button id="cargarCalendario">Actualizar</button>
      </div>
    </section>

    <section class="calendar-board">
      ${[`11:30`,`12:00`,`12:30`,`13:00`,`13:30`,`14:00`,`14:30`,`15:00`,`15:30`,`16:00`,`16:30`,`17:00`,`17:30`,`18:00`,`18:30`,`19:00`,`19:30`,`20:00`,`20:30`,`21:00`,`21:30`,`22:00`,`22:30`,`23:00`].map(e=>D(e)).join(``)}
    </section>
  `}function D(e){let t=n.reservas.filter(t=>c(t.hora)===e);return`
    <article class="calendar-slot ${t.length?`has-items`:``}">
      <time>${e}</time>
      <div>
        ${t.length?t.map(e=>`
              <button class="calendar-item estado-${a(e.estado)}" data-action="detalle" data-id="${e.id}">
                <strong>${a(e.cliente_nombre)}</strong>
                <span>${c(e.hora)}–${c(e.hora_fin)} · ${e.personas} personas · ${l(e.zona_preferida)} · Mesa ${e.mesa_id??`sin asignar`}</span>
              </button>
            `).join(``):`<span class="calendar-empty">Libre</span>`}
      </div>
    </article>
  `}function O(e,t){return`
    <article class="metric">
      <span>${e}</span>
      <strong>${t}</strong>
    </article>
  `}function k(){return`
    <section class="panel">
      <div class="section-title">
        <h3>Nueva reserva</h3>
      </div>
      <form id="formReserva" class="form inline-form">
        <input id="nombre" placeholder="Nombre del cliente" required />
        <input id="telefono" placeholder="Teléfono" required />
        <input id="personas" type="number" min="1" placeholder="Personas" required />
        <input id="fecha" type="date" value="${n.filters.fecha}" required />
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
  `}function A(e){let t=n.mesas.filter(t=>t.activa&&t.zona===e.zona_preferida&&t.capacidad>=e.personas);return`
    <article class="row-card estado-${a(e.estado)}">
      <div>
        <h3>${a(e.cliente_nombre)}</h3>
        <p>${a(e.cliente_telefono)} · ${e.personas} personas</p>
        <p>${a(e.fecha)} · ${a(c(e.hora))}–${a(c(e.hora_fin))} · ${l(e.zona_preferida)} · Mesa ${e.mesa_id??`sin asignar`}</p>
        ${e.observaciones?`<p class="note">${a(e.observaciones)}</p>`:``}
      </div>
      <span class="status ${a(e.estado)}">${a(e.estado)}</span>
      ${o()?`
        <div class="actions">
          <select data-mesa-reserva="${e.id}">
            <option value="">Asignar mesa</option>
            ${t.map(t=>`<option value="${t.id}" ${t.id===e.mesa_id?`selected`:``}>${a(t.nombre)} (${t.capacidad})</option>`).join(``)}
          </select>
          <button data-action="asignar" data-id="${e.id}" class="secondary">Asignar</button>
          <button data-action="detalle" data-id="${e.id}" class="secondary">Ver detalle</button>
          <button data-action="confirmar" data-id="${e.id}">Confirmar</button>
          <button data-action="cancelar" data-id="${e.id}" class="danger">Cancelar</button>
        </div>
      `:``}
    </article>
  `}function j(){let e=d();if(!e)return``;let t=n.mesas.filter(t=>t.activa&&t.zona===e.zona_preferida&&t.capacidad>=e.personas);return`
    <div class="modal-backdrop" role="presentation">
      <section class="reservation-detail" role="dialog" aria-modal="true" aria-labelledby="detalleReservaTitulo">
        <header>
          <button data-action="cerrar-detalle" class="icon-button" aria-label="Cerrar">×</button>
          <div>
            <p class="eyebrow">Reserva #${e.id}</p>
            <h2 id="detalleReservaTitulo">${a(e.cliente_nombre)}</h2>
          </div>
          <span class="status ${a(e.estado)}">${a(e.estado)}</span>
        </header>

        <div class="detail-grid">
          ${M(`Teléfono`,e.cliente_telefono)}
          ${M(`Fecha`,e.fecha)}
          ${M(`Hora`,c(e.hora))}
          ${M(`Hora de fin`,c(e.hora_fin))}
          ${M(`Personas`,e.personas)}
          ${M(`Comedor`,l(e.zona_preferida))}
          ${M(`Mesa asignada`,e.mesa_id??`Sin asignar`)}
          ${M(`Observaciones`,e.observaciones||`Sin observaciones`)}
        </div>

        ${o()?`
          <div class="detail-actions">
            <select data-mesa-reserva="${e.id}">
              <option value="">Asignar mesa</option>
              ${t.map(t=>`<option value="${t.id}" ${t.id===e.mesa_id?`selected`:``}>${a(t.nombre)} (${t.capacidad})</option>`).join(``)}
            </select>
            <button data-action="asignar" data-id="${e.id}" class="secondary">Asignar mesa</button>
            <button data-action="confirmar" data-id="${e.id}">Confirmar</button>
            <button data-action="cancelar" data-id="${e.id}" class="danger">Cancelar</button>
          </div>
        `:``}
      </section>
    </div>
  `}function M(e,t){return`
    <div class="detail-item">
      <span>${e}</span>
      <strong>${a(t)}</strong>
    </div>
  `}function N(){return`
    <section class="toolbar">
      <div>
        <p class="eyebrow">Sala</p>
        <h2>Plano de mesas</h2>
      </div>
      <div class="filters">
        <input id="filtroFecha" type="date" value="${n.filters.fecha}" />
        <input id="filtroHora" type="time" min="11:30" max="23:00" value="${n.filters.hora}" aria-label="Hora de consulta" />
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
        <span>${n.mesas.filter(e=>e.zona===`interior`).length} mesas</span>
      </div>
      <div class="mesas-grid floor-plan interior-plan">
        ${n.mesas.some(e=>e.zona===`interior`)?n.mesas.filter(e=>e.zona===`interior`).map(P).join(``):`<p class="empty">No hay mesas en el comedor interior.</p>`}
      </div>
    </section>

    <section class="dining-area">
      <div class="section-title">
        <h3>Terraza exterior</h3>
        <span>${n.mesas.filter(e=>e.zona===`exterior`).length} mesas</span>
      </div>
      <div class="mesas-grid floor-plan exterior-plan">
        ${n.mesas.some(e=>e.zona===`exterior`)?n.mesas.filter(e=>e.zona===`exterior`).map(P).join(``):`<p class="empty">No hay mesas en la terraza exterior.</p>`}
      </div>
    </section>

    ${s()?`
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
  `}function P(e){return`
    <article class="mesa-card mesa-${a(e.estado)}">
      <h3>${a(e.nombre)}</h3>
      <p>${e.capacidad} personas · ${l(e.zona)}</p>
      <strong>${a(e.estado)}</strong>
      ${s()?`
        <div class="mesa-actions">
          <button data-action="editar-mesa" data-id="${e.id}" class="secondary">Editar</button>
          <button data-action="toggle-mesa" data-id="${e.id}" data-activa="${e.activa}" class="${e.activa?`danger`:`secondary`}">${e.activa?`Desactivar`:`Activar`}</button>
        </div>
      `:``}
    </article>
  `}function F(){if(!s()||n.activeTab!==`mesas`)return``;let e=f();return e?`
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
            <input id="editarMesaNombre" value="${a(e.nombre)}" required />
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
  `:``}function I(){return`
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
      ${n.usuarios.length?n.usuarios.map(L).join(``):`<p class="empty">No hay usuarios cargados.</p>`}
    </section>
  `}function L(e){return`
    <article class="row-card">
      <div>
        <h3>${a(e.nombre)}</h3>
        <p>${a(e.email)} · ${a(e.rol)}</p>
      </div>
      <span class="status ${e.activo?`confirmada`:`cancelada`}">${e.activo?`Activo`:`Inactivo`}</span>
      <button data-action="toggle-usuario" data-id="${e.id}" class="secondary" ${e.id===n.user.id?`disabled`:``}>
        ${e.activo?`Desactivar`:`Activar`}
      </button>
    </article>
  `}function R(){document.querySelector(`#cargarReservas`)?.addEventListener(`click`,W),document.querySelector(`#cargarMesas`)?.addEventListener(`click`,K),document.querySelector(`#cargarUsuarios`)?.addEventListener(`click`,J),document.querySelector(`#cargarDashboard`)?.addEventListener(`click`,U),document.querySelector(`#cargarCalendario`)?.addEventListener(`click`,H),document.querySelector(`#formReserva`)?.addEventListener(`submit`,Y),document.querySelector(`#formMesa`)?.addEventListener(`submit`,X),document.querySelector(`#editarMesaForm`)?.addEventListener(`submit`,Z),document.querySelector(`#formUsuario`)?.addEventListener(`submit`,Q),document.querySelector(`#hora`)?.addEventListener(`change`,u),document.querySelector(`#filtroFecha`)?.addEventListener(`change`,e=>{n.filters.fecha=e.target.value}),document.querySelector(`#filtroHora`)?.addEventListener(`change`,e=>{n.filters.hora=e.target.value}),document.querySelector(`#filtroEstado`)?.addEventListener(`change`,e=>{n.filters.estado=e.target.value}),document.querySelector(`#filtroZona`)?.addEventListener(`change`,e=>{n.filters.zona=e.target.value}),document.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,$)})}async function z(e){e.preventDefault(),h(`Entrando...`);try{let e=await m(`/auth/login`,{method:`POST`,auth:!1,body:JSON.stringify({email:document.querySelector(`#loginEmail`).value,password:document.querySelector(`#loginPassword`).value})});n.user=e.user,n.token=e.access_token,localStorage.setItem(`user`,JSON.stringify(n.user)),localStorage.setItem(`token`,n.token),v(),await V()}catch(e){h(e.message,`error`)}}function B(e=!0){n.user=null,n.token=null,localStorage.removeItem(`user`),localStorage.removeItem(`token`),e&&_()}async function V(){try{n.activeTab===`reservas`||n.activeTab===`calendario`?await Promise.all([q(!1),G(!1)]):n.activeTab===`dashboard`?await U(!1):n.activeTab===`mesas`?await q(!1):n.activeTab===`usuarios`&&await J(!1),v()}catch(e){h(e.message,`error`)}}async function H(){n.filters.fecha=document.querySelector(`#filtroFecha`).value,n.filters.estado=``,await Promise.all([q(!1),G(!1)]),v()}async function U(e=!0){n.stats=await m(`/dashboard/stats`),e&&v()}async function W(){n.filters.fecha=document.querySelector(`#filtroFecha`).value,n.filters.estado=document.querySelector(`#filtroEstado`).value,n.filters.zona=document.querySelector(`#filtroZona`).value,await G()}async function G(e=!0){let t=new URLSearchParams;n.filters.fecha&&t.append(`fecha`,n.filters.fecha),n.filters.estado&&t.append(`estado`,n.filters.estado),n.filters.zona&&t.append(`zona`,n.filters.zona),n.reservas=await m(`/reservas/?${t.toString()}`),e&&v()}async function K(){n.filters.fecha=document.querySelector(`#filtroFecha`).value,n.filters.hora=document.querySelector(`#filtroHora`).value,await q()}async function q(e=!0){let t=new URLSearchParams;n.filters.fecha&&t.append(`fecha`,n.filters.fecha),n.filters.hora&&t.append(`hora`,n.filters.hora),n.mesas=await m(`/dashboard/mesas?${t.toString()}`),e&&v()}async function J(e=!0){n.usuarios=await m(`/usuarios/`),e&&v()}async function Y(e){e.preventDefault();try{await m(`/reservas/`,{method:`POST`,body:JSON.stringify({cliente_nombre:document.querySelector(`#nombre`).value,cliente_telefono:document.querySelector(`#telefono`).value,personas:Number(document.querySelector(`#personas`).value),fecha:document.querySelector(`#fecha`).value,hora:document.querySelector(`#hora`).value,hora_fin:document.querySelector(`#horaFin`).value,zona_preferida:document.querySelector(`#zonaPreferida`).value,observaciones:document.querySelector(`#observaciones`).value})}),n.filters.fecha=document.querySelector(`#fecha`).value,await Promise.all([G(!1),q(!1)]),v(),h(`Reserva creada.`,`success`)}catch(e){h(e.message,`error`)}}async function X(e){e.preventDefault();try{await m(`/mesas/`,{method:`POST`,body:JSON.stringify({nombre:document.querySelector(`#mesaNombre`).value,capacidad:Number(document.querySelector(`#mesaCapacidad`).value),zona:document.querySelector(`#mesaZona`).value})}),await q(!1),v(),h(`Mesa creada.`,`success`)}catch(e){h(e.message,`error`)}}async function Z(e){e.preventDefault();let t=f();if(t)try{await m(`/mesas/${t.id}`,{method:`PATCH`,body:JSON.stringify({nombre:document.querySelector(`#editarMesaNombre`).value,capacidad:Number(document.querySelector(`#editarMesaCapacidad`).value),zona:document.querySelector(`#editarMesaZona`).value,activa:document.querySelector(`#editarMesaActiva`).value===`true`})}),n.selectedMesaId=null,await q(!1),v(),h(`Mesa actualizada.`,`success`)}catch(e){h(e.message,`error`)}}async function Q(e){e.preventDefault();try{await m(`/usuarios/`,{method:`POST`,body:JSON.stringify({nombre:document.querySelector(`#usuarioNombre`).value,email:document.querySelector(`#usuarioEmail`).value,password:document.querySelector(`#usuarioPassword`).value,rol:document.querySelector(`#usuarioRol`).value})}),await J(!1),v(),h(`Usuario creado.`,`success`)}catch(e){h(e.message,`error`)}}async function $(e){let t=e.currentTarget,r=Number(t.dataset.id),i=t.dataset.action;try{if(i===`detalle`){n.selectedReservaId=r,n.mesas.length||await q(!1),v();return}if(i===`cerrar-detalle`){n.selectedReservaId=null,v();return}if(i===`editar-mesa`){n.selectedMesaId=r,v();return}if(i===`cerrar-edicion-mesa`){n.selectedMesaId=null,v();return}if(i===`confirmar`&&(await m(`/reservas/${r}/confirmar`,{method:`PATCH`}),n.selectedReservaId=r,await Promise.all([G(!1),q(!1)])),i===`cancelar`&&(await m(`/reservas/${r}/cancelar`,{method:`PATCH`}),n.selectedReservaId=r,await Promise.all([G(!1),q(!1)])),i===`asignar`){let e=Number(document.querySelector(`[data-mesa-reserva="${r}"]`).value);if(!e)throw Error(`Selecciona una mesa`);await m(`/reservas/${r}/asignar-mesa`,{method:`PATCH`,body:JSON.stringify({mesa_id:e})}),n.selectedReservaId=r,await Promise.all([G(!1),q(!1)])}i===`toggle-mesa`&&(await m(`/mesas/${r}`,{method:`PATCH`,body:JSON.stringify({activa:t.dataset.activa!==`true`})}),await q(!1)),i===`toggle-usuario`&&(await m(`/usuarios/${r}/toggle`,{method:`PATCH`}),await J(!1)),v(),h(`Cambios guardados.`,`success`)}catch(e){h(e.message,`error`)}}n.user&&n.token?(v(),V()):_();
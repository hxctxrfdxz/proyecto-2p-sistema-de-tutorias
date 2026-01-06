<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor tutor-tutorias">
      <div class="tarjeta">
        <h1>📅 Gestión de Tutorías</h1>
        <div id="info-tutor-tutorias">
          <p v-if="!usuario">Cargando información...</p>
          <p v-else><strong>{{ usuario.nombre }}</strong> — {{ usuario.correo }}</p>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📊 Calendario de Tutorías</h2>
        <div id="calendario-tutorias-tutor">
          <p v-if="!usuario">Cargando calendario...</p>
          <p v-else-if="tutoriasTutor.length === 0">No hay tutorías registradas.</p>

          <div v-else class="contenedor-tabla">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">Fecha</th>
                  <th style="text-align:left;padding:8px;">Hora</th>
                  <th style="text-align:left;padding:8px;">Estudiante</th>
                  <th style="text-align:left;padding:8px;">Asunto</th>
                  <th style="text-align:left;padding:8px;">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in tutoriasOrdenadas" :key="t.id">
                  <td style="padding:8px;">{{ t.fecha }}</td>
                  <td style="padding:8px;">{{ t.hora }}</td>
                  <td style="padding:8px;">{{ t.estudiante }}</td>
                  <td style="padding:8px;">{{ t.titulo }}</td>
                  <td style="padding:8px;">{{ t.estado }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top:10px;color:#666;font-size:.9em;">
            <strong>XML:</strong> Se guarda en LocalStorage como <code>tutoriasXML</code>.
            <button class="boton boton-pequeno" style="margin-left:10px;" @click="exportarXML">Exportar XML</button>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>📋 Solicitudes Pendientes</h2>
          <div id="solicitudes-pendientes-tutor" class="lista-tutorias">
            <p v-if="!usuario">Cargando solicitudes...</p>
            <p v-else-if="pendientes.length === 0">No hay solicitudes pendientes.</p>

            <div v-else style="display:flex;flex-direction:column;gap:10px;">
              <div v-for="t in pendientes" :key="t.id" class="tarjeta" style="padding:12px;">
                <div style="font-weight:800;">{{ t.estudiante }} — {{ t.titulo }}</div>
                <div style="margin-top:6px;color:#666;">{{ t.fecha }} — {{ t.hora }}</div>

                <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
                  <button class="boton primario" @click="confirmar(t)">✅ Confirmar</button>
                  <button class="boton secundario" @click="rechazar(t)">❌ Rechazar</button>
                  <button class="boton" @click="marcarEnRevision(t)">🔎 En revisión</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tarjeta">
          <h2>✅ Tutorías Confirmadas</h2>
          <div id="tutorias-confirmadas" class="lista-tutorias">
            <p v-if="!usuario">Cargando tutorías confirmadas...</p>
            <p v-else-if="confirmadas.length === 0">No hay tutorías confirmadas.</p>

            <div v-else style="display:flex;flex-direction:column;gap:10px;">
              <div v-for="t in confirmadas" :key="t.id" class="tarjeta" style="padding:12px;">
                <div style="font-weight:800;">{{ t.estudiante }} — {{ t.titulo }}</div>
                <div style="margin-top:6px;color:#666;">{{ t.fecha }} — {{ t.hora }}</div>

                <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
                  <button class="boton" @click="finalizar(t)">🏁 Finalizar</button>
                  <button class="boton secundario" @click="cancelar(t)">🚫 Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📝 Agenda de Hoy</h2>
        <div id="agenda-hoy">
          <p v-if="!usuario">Cargando agenda del día...</p>
          <p v-else-if="agendaHoy.length === 0">No tienes tutorías para hoy.</p>

          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div v-for="t in agendaHoy" :key="t.id" class="tarjeta" style="padding:12px;">
              <div style="font-weight:800;">{{ t.hora }} — {{ t.estudiante }}</div>
              <div style="margin-top:6px;color:#666;">{{ t.titulo }} ({{ t.estado }})</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📈 Estadísticas de Tutorías</h2>
        <div id="estadisticas-tutorias">
          <p v-if="!usuario">Cargando estadísticas...</p>

          <div v-else style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">Pendientes</div>
              <div style="font-size:1.4em;">{{ pendientes.length }}</div>
            </div>
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">Confirmadas</div>
              <div style="font-size:1.4em;">{{ confirmadas.length }}</div>
            </div>
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">Finalizadas</div>
              <div style="font-size:1.4em;">{{ finalizadas.length }}</div>
            </div>
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">Canceladas/Rechazadas</div>
              <div style="font-size:1.4em;">{{ canceladas.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>📅 Programar Tutoría</h2>

          <form id="formulario-programar-tutoria" novalidate @submit.prevent="programar">
            <div class="grupo-formulario">
              <label for="prog-estudiante">Estudiante *</label>
              <select id="prog-estudiante" v-model="form.estudiante" required>
                <option value="">-- Selecciona estudiante --</option>
                <option v-for="e in estudiantesTutor" :key="e.id" :value="e.nombre">{{ e.nombre }}</option>
              </select>
            </div>

            <div class="grupo-formulario">
              <label for="prog-titulo">Asunto *</label>
              <input id="prog-titulo" type="text" v-model.trim="form.titulo" placeholder="Ej: Revisión de avance..." required />
            </div>

            <div class="grupo-formulario">
              <label for="prog-fecha">Fecha *</label>
              <input id="prog-fecha" type="date" v-model="form.fecha" required />
            </div>

            <div class="grupo-formulario">
              <label for="prog-hora">Hora *</label>
              <input id="prog-hora" type="time" v-model="form.hora" required />
            </div>

            <div class="grupo-formulario">
              <label for="prog-duracion">Duración estimada</label>
              <select id="prog-duracion" v-model="form.duracion">
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1 hora 30 minutos</option>
              </select>
            </div>

            <div class="grupo-formulario">
              <label for="prog-modalidad">Modalidad</label>
              <select id="prog-modalidad" v-model="form.modalidad">
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="mixta">Mixta</option>
              </select>
            </div>

            <div class="grupo-formulario">
              <label for="prog-descripcion">Descripción (opcional)</label>
              <textarea id="prog-descripcion" rows="3" v-model.trim="form.descripcion" placeholder="Detalles adicionales..."></textarea>
            </div>

            <p class="alertas" id="prog-alerta">{{ alerta }}</p>
            <button class="boton primario" type="submit">Programar Tutoría</button>
          </form>
        </div>

        <div class="tarjeta">
          <h2>⚡ Acciones Rápidas</h2>
          <div id="acciones-rapidas-tutorias" style="display:flex;flex-direction:column;gap:10px;margin-top:15px;">
            <button class="boton primario" @click="verDisponibilidad">📅 Ver Mi Disponibilidad</button>
            <button class="boton primario" @click="exportarXML">📥 Exportar Calendario</button>
            <button class="boton secundario" @click="configurarHorario">⚙️ Configurar Horario</button>
            <button class="boton secundario" @click="verHistorialCompleto">📋 Ver Historial Completo</button>
          </div>

          <div style="margin-top:30px;padding:15px;background-color:#f8f9fa;border-radius:8px;">
            <h4>💡 Consejos para Tutorías Efectivas</h4>
            <ul style="margin-top:10px;font-size:.9em;">
              <li>📍 Agenda con al menos 24 horas de anticipación</li>
              <li>⏰ Respeta los horarios establecidos</li>
              <li>📝 Toma notas durante las sesiones</li>
              <li>📋 Prepara materiales con anticipación</li>
              <li>💬 Retroalimentación clara y constructiva</li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="toast.visible" :style="toastStyle">
        <span style="font-size:1.1em;">{{ toast.icono }}</span>
        <span>{{ toast.mensaje }}</span>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import BarraNavegacion from "../components/BarraNavegacion.vue";

const usuario = ref(null);
const alerta = ref("");

const toast = reactive({ visible: false, mensaje: "", icono: "ℹ️" });
const toastStyle = computed(() => ({
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 9999,
  background: "#2196f3",
  color: "white",
  padding: "12px 16px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,.2)",
}));

function mostrarToast(mensaje, tipo = "info") {
  const iconos = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.icono = iconos[tipo] || "ℹ️";
  toast.mensaje = mensaje;
  toast.visible = true;
  setTimeout(() => (toast.visible = false), 3500);
}

function obtenerUsuarioActual() {
  const raw = sessionStorage.getItem("usuarioActual");
  return raw ? JSON.parse(raw) : null;
}

function obtenerDatos() {
  const raw = localStorage.getItem("datosUleam");
  const datos = raw ? JSON.parse(raw) : {};
  if (!datos.notificaciones) datos.notificaciones = { estudiante: [], tutor: [], administrador: [] };
  if (!Array.isArray(datos.estudiantes)) datos.estudiantes = [];
  if (!Array.isArray(datos.tutores)) datos.tutores = [];
  return datos;
}

function guardarDatos(datos) {
  localStorage.setItem("datosUleam", JSON.stringify(datos));
}

function generarId() {
  return Date.now();
}

function hoyISO() {
  return new Date().toISOString().split("T")[0];
}

function exportarComoArchivo(nombre, contenido, mime = "application/xml") {
  const blob = new Blob([contenido], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function normalizarEstado(estado) {
  const e = String(estado || "").trim().toLowerCase();
  if (!e) return "pendiente";
  if (e === "solicitada" || e === "solicitud") return "pendiente";
  if (e === "activa") return "pendiente";
  if (e === "en_revision" || e === "en revisión" || e === "revision") return "revision";
  if (e === "confirmado") return "confirmada";
  if (e === "rechazado") return "rechazada";
  if (e === "cancelado") return "cancelada";
  return e;
}

function buscarEstudiantePorNombre(nombre) {
  const d = obtenerDatos();
  return (d.estudiantes || []).find((x) => String(x.nombre || "").trim() === String(nombre || "").trim()) || null;
}

function buscarEstudiantePorId(id) {
  const d = obtenerDatos();
  return (d.estudiantes || []).find((x) => Number(x.id) === Number(id)) || null;
}

function inferirTutorDesdeTutoria(t) {
  if (t.tutor && String(t.tutor).trim()) return String(t.tutor).trim();
  const est =
    t.estudianteId ? buscarEstudiantePorId(t.estudianteId) : buscarEstudiantePorNombre(t.estudiante);
  return est && est.tutor ? String(est.tutor).trim() : "";
}

function inferirEstudianteIdDesdeTutoria(t) {
  if (t.estudianteId) return Number(t.estudianteId);
  const est = buscarEstudiantePorNombre(t.estudiante);
  return est ? Number(est.id) : null;
}

function inferirTutorIdDesdeTutoria(t) {
  if (t.tutorId) return Number(t.tutorId);
  const tutorNombre = inferirTutorDesdeTutoria(t);
  if (!tutorNombre) return null;
  const d = obtenerDatos();
  const tu = (d.tutores || []).find((x) => String(x.nombre || "").trim() === tutorNombre);
  return tu ? Number(tu.id) : null;
}

function normalizarTutoria(t) {
  const estadoNorm = normalizarEstado(t.estado);
  const estudianteId = inferirEstudianteIdDesdeTutoria(t);
  const tutor = inferirTutorDesdeTutoria(t);
  const tutorId = inferirTutorIdDesdeTutoria(t);

  return {
    ...t,
    estado: estadoNorm,
    estudianteId,
    tutor,
    tutorId,
    estudiante: String(t.estudiante || "").trim(),
    titulo: String(t.titulo || "").trim(),
    fecha: String(t.fecha || "").trim(),
    hora: String(t.hora || "").trim(),
    duracion: String(t.duracion || "60"),
    modalidad: String(t.modalidad || "virtual"),
    descripcion: String(t.descripcion || ""),
  };
}

function leerTutoriasXML() {
  const xml = localStorage.getItem("tutoriasXML") || "<tutorias></tutorias>";
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const nodos = Array.from(doc.getElementsByTagName("tutoria"));

  return nodos.map((n) =>
    normalizarTutoria({
      id: n.getAttribute("id") || "",
      estudiante: n.getAttribute("estudiante") || "",
      estudianteId: n.getAttribute("estudianteId") || "",
      tutor: n.getAttribute("tutor") || "",
      tutorId: n.getAttribute("tutorId") || "",
      titulo: n.getAttribute("titulo") || "",
      fecha: n.getAttribute("fecha") || "",
      hora: n.getAttribute("hora") || "",
      estado: n.getAttribute("estado") || "pendiente",
      duracion: n.getAttribute("duracion") || "60",
      modalidad: n.getAttribute("modalidad") || "virtual",
      descripcion: n.getAttribute("descripcion") || "",
    })
  );
}

function escribirTutoriasXML(lista) {
  const doc = document.implementation.createDocument("", "", null);
  const root = doc.createElement("tutorias");
  doc.appendChild(root);

  lista.map(normalizarTutoria).forEach((t) => {
    const el = doc.createElement("tutoria");
    el.setAttribute("id", String(t.id));
    el.setAttribute("estudiante", t.estudiante);
    if (t.estudianteId !== null && t.estudianteId !== undefined) el.setAttribute("estudianteId", String(t.estudianteId));
    el.setAttribute("tutor", t.tutor || "");
    if (t.tutorId !== null && t.tutorId !== undefined) el.setAttribute("tutorId", String(t.tutorId));
    el.setAttribute("titulo", t.titulo);
    el.setAttribute("fecha", t.fecha);
    el.setAttribute("hora", t.hora);
    el.setAttribute("estado", normalizarEstado(t.estado));
    el.setAttribute("duracion", String(t.duracion || "60"));
    el.setAttribute("modalidad", t.modalidad || "virtual");
    el.setAttribute("descripcion", t.descripcion || "");
    root.appendChild(el);
  });

  const xml = new XMLSerializer().serializeToString(doc);
  localStorage.setItem("tutoriasXML", xml);
  return xml;
}

function notificarEstudiante(nombreEstudiante, mensaje, tipo) {
  const d = obtenerDatos();
  d.notificaciones.estudiante.push({
    id: generarId(),
    tipo,
    mensaje,
    fecha: hoyISO(),
    leida: false,
    paraUsuario: nombreEstudiante,
  });
  guardarDatos(d);
}

function notificarTutor(nombreTutor, mensaje, tipo) {
  const d = obtenerDatos();
  d.notificaciones.tutor.push({
    id: generarId(),
    tipo,
    mensaje,
    fecha: hoyISO(),
    leida: false,
    paraUsuario: nombreTutor,
  });
  guardarDatos(d);
}

const datos = computed(() => obtenerDatos());

const tutorias = ref([]);

const tutoriasTutor = computed(() => {
  if (!usuario.value) return [];
  const uNombre = String(usuario.value.nombre || "").trim();
  const uId = usuario.value.id ? Number(usuario.value.id) : null;

  return tutorias.value
    .map(normalizarTutoria)
    .filter((t) => {
      if (t.tutor && String(t.tutor).trim() === uNombre) return true;
      if (uId && t.tutorId && Number(t.tutorId) === uId) return true;
      return false;
    });
});

const tutoriasOrdenadas = computed(() => {
  return [...tutoriasTutor.value].sort((a, b) => {
    const da = new Date(`${a.fecha}T${a.hora || "00:00"}`);
    const db = new Date(`${b.fecha}T${b.hora || "00:00"}`);
    return da - db;
  });
});

const pendientes = computed(() => tutoriasTutor.value.filter((t) => t.estado === "pendiente"));
const confirmadas = computed(() => tutoriasTutor.value.filter((t) => t.estado === "confirmada"));
const finalizadas = computed(() => tutoriasTutor.value.filter((t) => t.estado === "finalizada"));
const canceladas = computed(() => tutoriasTutor.value.filter((t) => t.estado === "cancelada" || t.estado === "rechazada"));

const agendaHoy = computed(() => {
  const hoy = hoyISO();
  return tutoriasTutor.value.filter((t) => t.fecha === hoy && (t.estado === "confirmada" || t.estado === "pendiente"));
});

const estudiantesTutor = computed(() => {
  if (!usuario.value) return [];
  return datos.value.estudiantes.filter((e) => String(e.tutor || "").trim() === String(usuario.value.nombre || "").trim());
});

const form = reactive({
  estudiante: "",
  titulo: "",
  fecha: "",
  hora: "",
  duracion: "60",
  modalidad: "virtual",
  descripcion: "",
});

function validarFechaFutura(fecha) {
  const f = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return f >= hoy;
}

function validarHoraFutura(fecha, hora) {
  if (!validarFechaFutura(fecha)) return false;
  const fh = new Date(`${fecha}T${hora}`);
  return fh.getTime() > Date.now();
}

function hayChoqueHorario(fecha, hora, duracionMin) {
  const inicio = new Date(`${fecha}T${hora}`).getTime();
  const fin = inicio + Number(duracionMin) * 60000;

  return tutoriasTutor.value.some((t) => {
    if (t.fecha !== fecha) return false;
    if (t.estado === "cancelada" || t.estado === "rechazada") return false;
    const i2 = new Date(`${t.fecha}T${t.hora}`).getTime();
    const f2 = i2 + Number(t.duracion || 60) * 60000;
    return inicio < f2 && fin > i2;
  });
}

function recargarTutorias() {
  tutorias.value = leerTutoriasXML();
}

function actualizarTutoriaEstado(tutoria, nuevoEstado) {
  const lista = leerTutoriasXML();
  const idx = lista.findIndex((x) => String(x.id) === String(tutoria.id));
  if (idx === -1) {
    mostrarToast("Tutoría no encontrada", "error");
    return;
  }

  const t = normalizarTutoria(lista[idx]);
  t.estado = normalizarEstado(nuevoEstado);

  if (!t.tutor && usuario.value?.nombre) t.tutor = usuario.value.nombre;
  if (!t.tutorId && usuario.value?.id) t.tutorId = usuario.value.id;

  lista[idx] = t;
  escribirTutoriasXML(lista);
  recargarTutorias();
}

function confirmar(t) {
  actualizarTutoriaEstado(t, "confirmada");
  notificarEstudiante(t.estudiante, `✅ Tutoría confirmada para ${t.fecha} a las ${t.hora}`, "tutoria_confirmada");
  mostrarToast("Tutoría confirmada", "success");
}

function rechazar(t) {
  actualizarTutoriaEstado(t, "rechazada");
  notificarEstudiante(t.estudiante, `❌ Tutoría rechazada para ${t.fecha} a las ${t.hora}`, "tutoria_rechazada");
  mostrarToast("Tutoría rechazada", "warning");
}

function marcarEnRevision(t) {
  actualizarTutoriaEstado(t, "revision");
  notificarEstudiante(t.estudiante, `🔎 Tu solicitud de tutoría está en revisión`, "tutoria_revision");
  mostrarToast("Marcada en revisión", "info");
}

function finalizar(t) {
  actualizarTutoriaEstado(t, "finalizada");
  notificarEstudiante(t.estudiante, `🏁 Tutoría finalizada (${t.fecha} ${t.hora})`, "tutoria_finalizada");
  mostrarToast("Tutoría finalizada", "success");
}

function cancelar(t) {
  actualizarTutoriaEstado(t, "cancelada");
  notificarEstudiante(t.estudiante, `🚫 Tutoría cancelada (${t.fecha} ${t.hora})`, "tutoria_cancelada");
  mostrarToast("Tutoría cancelada", "warning");
}

function programar() {
  alerta.value = "";
  const errores = [];

  if (!usuario.value) errores.push("No hay tutor activo");
  if (!form.estudiante) errores.push("Debe seleccionar un estudiante");
  if (!form.titulo || form.titulo.trim().length < 5) errores.push("Asunto inválido (mínimo 5 caracteres)");
  if (!form.fecha) errores.push("Debe seleccionar fecha");
  else if (!validarFechaFutura(form.fecha)) errores.push("La fecha debe ser hoy o futura");
  if (!form.hora) errores.push("Debe seleccionar hora");
  else if (!validarHoraFutura(form.fecha, form.hora)) errores.push("La fecha y hora deben ser futuras");
  if (hayChoqueHorario(form.fecha, form.hora, form.duracion)) errores.push("Hay choque de horario con otra tutoría");

  if (errores.length) {
    alerta.value = "❌ " + errores.join(". ");
    return;
  }

  const estObj = buscarEstudiantePorNombre(form.estudiante);
  const lista = leerTutoriasXML();

  const nueva = normalizarTutoria({
    id: generarId(),
    estudiante: form.estudiante,
    estudianteId: estObj ? estObj.id : "",
    tutor: usuario.value.nombre,
    tutorId: usuario.value.id || "",
    titulo: form.titulo.trim(),
    fecha: form.fecha,
    hora: form.hora,
    estado: "confirmada",
    duracion: form.duracion,
    modalidad: form.modalidad,
    descripcion: (form.descripcion || "").trim(),
  });

  lista.push(nueva);
  escribirTutoriasXML(lista);
  recargarTutorias();

  notificarEstudiante(nueva.estudiante, `📅 El tutor programó una tutoría para ${nueva.fecha} a las ${nueva.hora}`, "tutoria_programada");
  notificarTutor(usuario.value.nombre, `📅 Programaste una tutoría con ${nueva.estudiante} (${nueva.fecha} ${nueva.hora})`, "tutoria_programada");

  mostrarToast("Tutoría programada", "success");
  limpiarFormulario();
}

function limpiarFormulario() {
  form.estudiante = "";
  form.titulo = "";
  form.fecha = "";
  form.hora = "";
  form.duracion = "60";
  form.modalidad = "virtual";
  form.descripcion = "";
}

function exportarXML() {
  const xml = localStorage.getItem("tutoriasXML") || "<tutorias></tutorias>";
  exportarComoArchivo("tutorias.xml", xml, "application/xml");
  mostrarToast("Exportado tutorias.xml", "success");
}

function verDisponibilidad() {
  mostrarToast("Disponibilidad mostrada (demo). Usa el calendario para ver choques.", "info");
}

function configurarHorario() {
  mostrarToast("Configuración de horario (demo)", "info");
}

function verHistorialCompleto() {
  mostrarToast("Historial completo (demo)", "info");
}

onMounted(() => {
  usuario.value = obtenerUsuarioActual();

  if (!localStorage.getItem("tutoriasXML")) {
    localStorage.setItem("tutoriasXML", "<tutorias></tutorias>");
  }

  recargarTutorias();
});
</script>

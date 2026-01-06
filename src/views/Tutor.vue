<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor">
      <div class="tarjeta">
        <h1 id="titulo-bienvenida">Panel del Tutor</h1>
        <div id="info-tutor">
          <p v-if="!usuario">Cargando información...</p>
          <div v-else>
            <p><strong>Nombre:</strong> {{ usuario.nombre }}</p>
            <p><strong>Correo:</strong> {{ usuario.correo }}</p>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>🔔 Notificaciones Recientes</h2>
        <div id="notificaciones-tutor" class="contenedor-notificaciones">
          <p v-if="!usuario">Cargando notificaciones...</p>
          <p v-else-if="notificacionesRecientes.length === 0">📭 No hay notificaciones</p>
          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div
              v-for="n in notificacionesRecientes"
              :key="n.id"
              class="tarjeta"
              style="padding:12px;"
            >
              <div style="display:flex;justify-content:space-between;gap:10px;">
                <div style="flex:1;">
                  <div style="font-weight:700;">{{ n.tipo }}</div>
                  <div style="margin-top:4px;">{{ n.mensaje }}</div>
                  <div style="margin-top:6px;color:#666;font-size:.9em;">
                    {{ formatearFecha(n.fecha) }}
                  </div>
                </div>
                <button class="boton boton-pequeno" @click="marcarLeida(n.id)" v-if="!n.leida">
                  Marcar leída
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>👥 Mis Estudiantes</h2>
          <div id="estudiantes-tutor">
            <p v-if="!usuario">Cargando estudiantes...</p>
            <p v-else-if="misEstudiantes.length === 0">Aún no tienes estudiantes asignados.</p>
            <div v-else class="contenedor-tabla">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr>
                    <th style="text-align:left;padding:8px;">Nombre</th>
                    <th style="text-align:left;padding:8px;">Tema</th>
                    <th style="text-align:left;padding:8px;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="e in misEstudiantes" :key="e.id">
                    <td style="padding:8px;">{{ e.nombre }}</td>
                    <td style="padding:8px;">{{ e.tema || "—" }}</td>
                    <td style="padding:8px;">{{ e.estado || "Activo" }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="tarjeta">
          <h2>📊 Resumen de Actividad</h2>
          <div id="resumen-tutor">
            <p v-if="!usuario">Cargando resumen...</p>
            <div v-else style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
              <div class="tarjeta" style="padding:10px;">
                <div style="font-weight:700;">Entregas pendientes</div>
                <div style="font-size:1.4em;">{{ entregasPendientes.length }}</div>
              </div>
              <div class="tarjeta" style="padding:10px;">
                <div style="font-weight:700;">Tutorías pendientes (XML)</div>
                <div style="font-size:1.4em;">{{ tutoriasPendientes.length }}</div>
              </div>
              <div class="tarjeta" style="padding:10px;">
                <div style="font-weight:700;">Tareas creadas</div>
                <div style="font-size:1.4em;">{{ tareasCreadas.length }}</div>
              </div>
              <div class="tarjeta" style="padding:10px;">
                <div style="font-weight:700;">Estudiantes asignados</div>
                <div style="font-size:1.4em;">{{ misEstudiantes.length }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📋 Entregas Pendientes de Revisión</h2>
        <div id="entregas-pendientes" class="historial-entregas">
          <p v-if="!usuario">Cargando entregas pendientes...</p>
          <p v-else-if="entregasPendientes.length === 0">No hay entregas pendientes.</p>
          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div v-for="en in entregasPendientes.slice(0,5)" :key="en.id" class="tarjeta" style="padding:12px;">
              <div style="display:flex;justify-content:space-between;gap:10px;">
                <div>
                  <div style="font-weight:700;">{{ en.estudiante }} — {{ en.fase }}</div>
                  <div style="margin-top:4px;">{{ en.descripcion }}</div>
                  <div style="margin-top:6px;color:#666;font-size:.9em;">
                    {{ formatearFecha(en.fechaEntrega || en.fecha) }}
                  </div>
                </div>
                <RouterLink class="boton primario" to="/entregas-tutor">Revisar</RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📅 Solicitudes de Tutoría Pendientes</h2>
        <div id="solicitudes-pendientes" class="lista-tutorias">
          <p v-if="!usuario">Cargando solicitudes...</p>
          <p v-else-if="tutoriasPendientes.length === 0">No hay solicitudes pendientes.</p>
          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div v-for="t in tutoriasPendientes.slice(0,5)" :key="t.id" class="tarjeta" style="padding:12px;">
              <div style="display:flex;justify-content:space-between;gap:10px;">
                <div>
                  <div style="font-weight:700;">{{ t.estudiante }} — {{ t.titulo }}</div>
                  <div style="margin-top:6px;color:#666;font-size:.9em;">
                    {{ formatearFecha(t.fecha) }} — {{ t.hora }}
                  </div>
                </div>
                <RouterLink class="boton primario" to="/tutorias-tutor">Gestionar</RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>⚡ Acciones Rápidas</h2>
          <div id="acciones-rapidas-tutor" style="display:flex;flex-direction:column;gap:10px;margin-top:15px;">
            <RouterLink to="/crear-tarea" class="boton primario">📝 Crear Nueva Tarea</RouterLink>
            <RouterLink to="/entregas-tutor" class="boton primario">📄 Revisar Todas las Entregas</RouterLink>
            <RouterLink to="/tutorias-tutor" class="boton primario">📅 Gestionar Tutorías</RouterLink>
            <RouterLink to="/estudiantes" class="boton primario">👥 Ver Todos los Estudiantes</RouterLink>
            <button class="boton secundario" id="boton-reporte-tutor" @click="generarReporte">
              📊 Generar Reporte
            </button>
          </div>
        </div>

        <div class="tarjeta">
          <h2>📅 Próximas Tutorías Confirmadas</h2>
          <div id="proximas-tutorias">
            <p v-if="!usuario">Cargando tutorías...</p>
            <p v-else-if="tutoriasConfirmadas.length === 0">No hay tutorías confirmadas.</p>
            <div v-else style="display:flex;flex-direction:column;gap:10px;">
              <div v-for="t in tutoriasConfirmadas.slice(0,5)" :key="t.id" class="tarjeta" style="padding:12px;">
                <div style="font-weight:700;">{{ t.estudiante }} — {{ t.titulo }}</div>
                <div style="margin-top:6px;color:#666;font-size:.9em;">
                  {{ formatearFecha(t.fecha) }} — {{ t.hora }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📈 Progreso de Estudiantes</h2>
        <div id="progreso-estudiantes">
          <p v-if="!usuario">Cargando progreso...</p>
          <p v-else-if="misEstudiantes.length === 0">No hay estudiantes para mostrar progreso.</p>
          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div v-for="e in misEstudiantes" :key="e.id" class="tarjeta" style="padding:12px;">
              <div style="display:flex;justify-content:space-between;gap:10px;">
                <div>
                  <div style="font-weight:700;">{{ e.nombre }}</div>
                  <div style="margin-top:4px;color:#666;">Tema: {{ e.tema || "—" }}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-weight:700;">Entregas</div>
                  <div style="font-size:1.2em;">
                    {{ contarEntregasEstudiante(e.nombre) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>

    <div v-if="toast.visible" :style="toastStyle">
      <span style="font-size:1.1em;">{{ toast.icono }}</span>
      <span>{{ toast.mensaje }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import BarraNavegacion from "../components/BarraNavegacion.vue";

const usuario = ref(null);
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

function obtenerDatos() {
  const raw = localStorage.getItem("datosUleam");
  const datos = raw ? JSON.parse(raw) : {};
  if (!datos.notificaciones) {
    datos.notificaciones = { estudiante: [], tutor: [], administrador: [] };
  }
  if (!Array.isArray(datos.usuarios)) datos.usuarios = [];
  if (!Array.isArray(datos.estudiantes)) datos.estudiantes = [];
  if (!Array.isArray(datos.tutores)) datos.tutores = [];
  if (!Array.isArray(datos.tareas)) datos.tareas = [];
  if (!Array.isArray(datos.entregas)) datos.entregas = [];
  if (!Array.isArray(datos.temas)) datos.temas = [];
  return datos;
}

function guardarDatos(datos) {
  localStorage.setItem("datosUleam", JSON.stringify(datos));
}

function obtenerUsuarioActual() {
  const raw = sessionStorage.getItem("usuarioActual");
  return raw ? JSON.parse(raw) : null;
}

function formatearFecha(fechaStr) {
  try {
    const f = new Date(fechaStr);
    return f.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return fechaStr;
  }
}

function leerTutoriasXML() {
  const xml = localStorage.getItem("tutoriasXML") || "<tutorias></tutorias>";
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const nodos = Array.from(doc.getElementsByTagName("tutoria"));
  return nodos.map((n) => ({
    id: n.getAttribute("id") || "",
    estudiante: n.getAttribute("estudiante") || "",
    tutor: n.getAttribute("tutor") || "",
    titulo: n.getAttribute("titulo") || "",
    fecha: n.getAttribute("fecha") || "",
    hora: n.getAttribute("hora") || "",
    estado: n.getAttribute("estado") || "pendiente",
  }));
}

const datos = computed(() => obtenerDatos());

const misEstudiantes = computed(() => {
  if (!usuario.value) return [];
  return datos.value.estudiantes.filter((e) => e.tutor === usuario.value.nombre);
});

const entregasPendientes = computed(() => {
  if (!usuario.value) return [];
  return datos.value.entregas.filter((e) => e.tutor === usuario.value.nombre && e.estado === "revision");
});

const tareasCreadas = computed(() => {
  if (!usuario.value) return [];
  return datos.value.tareas.filter((t) => t.creador === usuario.value.nombre);
});

const notificacionesRecientes = computed(() => {
  if (!usuario.value) return [];
  const todas = datos.value.notificaciones.tutor || [];
  const filtradas = todas.filter((n) => !n.paraUsuario || n.paraUsuario === usuario.value.nombre);
  return filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 6);
});

const tutorias = computed(() => leerTutoriasXML());

const tutoriasPendientes = computed(() => {
  if (!usuario.value) return [];
  return tutorias.value.filter((t) => t.tutor === usuario.value.nombre && t.estado === "pendiente");
});

const tutoriasConfirmadas = computed(() => {
  if (!usuario.value) return [];
  return tutorias.value.filter((t) => t.tutor === usuario.value.nombre && t.estado === "confirmada");
});

function marcarLeida(id) {
  const d = obtenerDatos();
  const lista = d.notificaciones.tutor || [];
  const n = lista.find((x) => String(x.id) === String(id));
  if (n) {
    n.leida = true;
    guardarDatos(d);
    mostrarToast("Notificación marcada como leída", "success");
  }
}

function contarEntregasEstudiante(nombre) {
  return datos.value.entregas.filter((e) => e.estudiante === nombre).length;
}

function generarReporte() {
  mostrarToast("Reporte generado (demo)", "info");
}

onMounted(() => {
  usuario.value = obtenerUsuarioActual();
});
</script>

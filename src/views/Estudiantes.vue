<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor">
      <div class="tarjeta">
        <h1>👥 Lista de Estudiantes</h1>
        <div id="info-estudiantes">
          <p>Sistema de Gestión de Tutorías de Titulación - ULEAM</p>
        </div>
      </div>

      <div class="tarjeta">
        <h2>🔍 Filtros de Búsqueda</h2>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
          <div>
            <label for="filtro-estado">Filtrar por estado:</label>
            <select id="filtro-estado" class="input-texto" v-model="filtros.estado">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en-progreso">En progreso</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          <div>
            <label for="filtro-tutor">Filtrar por tutor:</label>
            <select id="filtro-tutor" class="input-texto" v-model="filtros.tutor">
              <option value="">Todos los tutores</option>
              <option v-for="t in tutoresUnicos" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div>
            <label for="buscar-nombre">Buscar por nombre:</label>
            <input
              type="text"
              id="buscar-nombre"
              class="input-texto"
              v-model.trim="filtros.nombre"
              placeholder="Nombre del estudiante..."
            />
          </div>

          <div style="align-self:end;">
            <button class="boton" id="btn-aplicar-filtros" @click="aplicarFiltros">Aplicar Filtros</button>
            <button class="boton secundario" id="btn-limpiar-filtros" @click="limpiarFiltros" style="margin-left:10px;">Limpiar</button>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="margin:0;">📋 Estudiantes Registrados</h2>
          <button class="boton" id="btn-exportar-estudiantes" @click="exportarJSON">📥 Exportar Lista</button>
        </div>

        <div id="lista-estudiantes" class="contenedor-tabla">
          <p v-if="estudiantesFiltrados.length === 0">No hay estudiantes para mostrar.</p>

          <div v-else class="contenedor-tabla">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">Nombre</th>
                  <th style="text-align:left;padding:8px;">Correo</th>
                  <th style="text-align:left;padding:8px;">Tutor</th>
                  <th style="text-align:left;padding:8px;">Estado</th>
                  <th style="text-align:left;padding:8px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in estudiantesFiltrados" :key="e.id">
                  <td style="padding:8px;">{{ e.nombre }}</td>
                  <td style="padding:8px;">{{ e.correo }}</td>
                  <td style="padding:8px;">{{ e.tutor || "—" }}</td>
                  <td style="padding:8px;">{{ e.estado || "pendiente" }}</td>
                  <td style="padding:8px;">
                    <button class="boton boton-pequeno" @click="verDetalles(e)">Ver</button>
                    <button class="boton boton-pequeno secundario" style="margin-left:8px;" @click="cambiarEstadoRapido(e)">
                      Cambiar estado
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div id="estadisticas-estudiantes" style="margin-top:20px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
              <div class="tarjeta" style="padding:12px;">
                <div style="font-weight:700;">Total</div>
                <div style="font-size:1.4em;">{{ estudiantes.length }}</div>
              </div>
              <div class="tarjeta" style="padding:12px;">
                <div style="font-weight:700;">Sin tutor</div>
                <div style="font-size:1.4em;">{{ sinTutor.length }}</div>
              </div>
              <div class="tarjeta" style="padding:12px;">
                <div style="font-weight:700;">Con tema</div>
                <div style="font-size:1.4em;">{{ conTema.length }}</div>
              </div>
              <div class="tarjeta" style="padding:12px;">
                <div style="font-weight:700;">Entregas</div>
                <div style="font-size:1.4em;">{{ totalEntregas }}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="tarjeta" id="detalles-estudiante-container" v-show="detalle.visible" style="margin-top:20px;">
        <h2>👤 Detalles del Estudiante</h2>

        <div id="detalles-estudiante">
          <div v-if="!detalle.estudiante">Selecciona un estudiante.</div>

          <div v-else>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:15px;">
              <div class="tarjeta" style="padding:12px;">
                <div style="font-weight:800;">{{ detalle.estudiante.nombre }}</div>
                <div style="margin-top:6px;color:#666;">{{ detalle.estudiante.correo }}</div>
                <div style="margin-top:6px;"><strong>Tutor:</strong> {{ detalle.estudiante.tutor || "—" }}</div>
                <div style="margin-top:6px;"><strong>Tema:</strong> {{ detalle.estudiante.tema || "—" }}</div>
                <div style="margin-top:6px;"><strong>Estado:</strong> {{ detalle.estudiante.estado || "pendiente" }}</div>
              </div>

              <div class="tarjeta" style="padding:12px;">
                <div style="font-weight:800;">Acciones</div>

                <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
                  <div>
                    <label>Estado</label>
                    <select v-model="detalle.nuevoEstado">
                      <option value="pendiente">Pendiente</option>
                      <option value="en-progreso">En progreso</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>

                  <div>
                    <label>Observación (opcional)</label>
                    <textarea rows="2" v-model.trim="detalle.observacion" placeholder="Ej: Cambió por avance de capítulo..."></textarea>
                  </div>

                  <button class="boton primario" @click="guardarEstadoDetalle">Guardar</button>
                  <button class="boton secundario" @click="cerrarDetalle">Cerrar</button>
                </div>
              </div>
            </div>

            <div class="tarjeta" style="margin-top:15px;padding:12px;">
              <h3 style="margin-top:0;">📚 Historial (Tareas / Entregas)</h3>

              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:10px;">
                <div class="tarjeta" style="padding:12px;">
                  <div style="font-weight:800;">Tareas</div>
                  <p v-if="tareasDetalle.length===0">Sin tareas.</p>
                  <div v-else style="display:flex;flex-direction:column;gap:8px;">
                    <div v-for="t in tareasDetalle.slice(0,6)" :key="t.id" class="tarjeta" style="padding:10px;">
                      <div style="font-weight:700;">{{ t.titulo }}</div>
                      <div style="color:#666;margin-top:4px;">{{ t.fase }} — {{ t.fechaLimite }} {{ t.hora }}</div>
                    </div>
                  </div>
                </div>

                <div class="tarjeta" style="padding:12px;">
                  <div style="font-weight:800;">Entregas</div>
                  <p v-if="entregasDetalle.length===0">Sin entregas.</p>
                  <div v-else style="display:flex;flex-direction:column;gap:8px;">
                    <div v-for="e in entregasDetalle.slice(0,6)" :key="e.id" class="tarjeta" style="padding:10px;">
                      <div style="font-weight:700;">{{ e.fase }} — {{ e.estado }}</div>
                      <div style="color:#666;margin-top:4px;">{{ e.fechaEntrega || e.fecha }}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

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
  if (!datos.notificaciones) datos.notificaciones = { estudiante: [], tutor: [], administrador: [] };
  if (!Array.isArray(datos.estudiantes)) datos.estudiantes = [];
  if (!Array.isArray(datos.tutores)) datos.tutores = [];
  if (!Array.isArray(datos.tareas)) datos.tareas = [];
  if (!Array.isArray(datos.entregas)) datos.entregas = [];
  if (!Array.isArray(datos.historialEstadosEstudiante)) datos.historialEstadosEstudiante = [];
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

function exportarComoArchivo(nombre, contenido, mime = "application/json") {
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

const filtros = reactive({
  estado: "",
  tutor: "",
  nombre: "",
});

const datos = computed(() => obtenerDatos());
const estudiantes = computed(() => datos.value.estudiantes);
const tutores = computed(() => datos.value.tutores);

const tutoresUnicos = computed(() => {
  const set = new Set(estudiantes.value.map((e) => e.tutor).filter(Boolean));
  return Array.from(set).sort();
});

const estudiantesFiltrados = ref([]);

function aplicarFiltros() {
  let lista = estudiantes.value;

  if (filtros.estado) lista = lista.filter((e) => (e.estado || "pendiente") === filtros.estado);
  if (filtros.tutor) lista = lista.filter((e) => (e.tutor || "") === filtros.tutor);
  if (filtros.nombre) {
    const q = filtros.nombre.toLowerCase();
    lista = lista.filter((e) => (e.nombre || "").toLowerCase().includes(q));
  }

  estudiantesFiltrados.value = lista;
}

function limpiarFiltros() {
  filtros.estado = "";
  filtros.tutor = "";
  filtros.nombre = "";
  aplicarFiltros();
}

const sinTutor = computed(() => estudiantes.value.filter((e) => !e.tutor));
const conTema = computed(() => estudiantes.value.filter((e) => !!e.tema));
const totalEntregas = computed(() => datos.value.entregas.length);

const detalle = reactive({
  visible: false,
  estudiante: null,
  nuevoEstado: "pendiente",
  observacion: "",
});

const tareasDetalle = computed(() => {
  if (!detalle.estudiante) return [];
  return datos.value.tareas.filter((t) => t.estudiante === detalle.estudiante.nombre);
});

const entregasDetalle = computed(() => {
  if (!detalle.estudiante) return [];
  return datos.value.entregas.filter((e) => e.estudiante === detalle.estudiante.nombre);
});

function verDetalles(estudiante) {
  detalle.visible = true;
  detalle.estudiante = estudiante;
  detalle.nuevoEstado = estudiante.estado || "pendiente";
  detalle.observacion = "";
}

function cerrarDetalle() {
  detalle.visible = false;
  detalle.estudiante = null;
  detalle.observacion = "";
}

function cambiarEstadoRapido(estudiante) {
  const actual = estudiante.estado || "pendiente";
  const siguiente = actual === "pendiente" ? "en-progreso" : actual === "en-progreso" ? "finalizado" : "pendiente";
  estudiante.estado = siguiente;

  const d = obtenerDatos();
  const idx = d.estudiantes.findIndex((x) => x.id === estudiante.id);
  if (idx !== -1) {
    d.estudiantes[idx].estado = siguiente;
    d.historialEstadosEstudiante.push({
      id: generarId(),
      fecha: hoyISO(),
      estudiante: estudiante.nombre,
      anterior: actual,
      nuevo: siguiente,
      observacion: "Cambio rápido desde lista",
    });
    guardarDatos(d);
    mostrarToast("Estado actualizado", "success");
    aplicarFiltros();
  }
}

function guardarEstadoDetalle() {
  if (!detalle.estudiante) return;

  const d = obtenerDatos();
  const idx = d.estudiantes.findIndex((x) => x.id === detalle.estudiante.id);
  if (idx === -1) {
    mostrarToast("No se encontró el estudiante", "error");
    return;
  }

  const anterior = d.estudiantes[idx].estado || "pendiente";
  d.estudiantes[idx].estado = detalle.nuevoEstado;

  d.historialEstadosEstudiante.push({
    id: generarId(),
    fecha: hoyISO(),
    estudiante: detalle.estudiante.nombre,
    anterior,
    nuevo: detalle.nuevoEstado,
    observacion: (detalle.observacion || "").trim(),
  });

  guardarDatos(d);
  mostrarToast("Detalle guardado", "success");

  detalle.estudiante = d.estudiantes[idx];
  aplicarFiltros();
}

function exportarJSON() {
  const d = obtenerDatos();
  exportarComoArchivo("estudiantes.json", JSON.stringify(d.estudiantes, null, 2), "application/json");
  mostrarToast("Exportado estudiantes.json", "success");
}

onMounted(() => {
  aplicarFiltros();
});
</script>

<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor entregas-tutor">
      <div class="tarjeta">
        <h1>📄 Revisar Entregas</h1>
        <div id="info-revisor">
          <p v-if="!usuario">Cargando información...</p>
          <p v-else><strong>{{ usuario.nombre }}</strong> — {{ usuario.correo }}</p>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📊 Filtros de Búsqueda</h2>
        <div id="filtros-entregas" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
          <div>
            <label for="filtro-estado">Estado</label>
            <select id="filtro-estado" v-model="filtros.estado">
              <option value="todos">Todos los estados</option>
              <option value="revision">En revisión</option>
              <option value="correccion">Necesita corrección</option>
              <option value="aprobada">Aprobadas</option>
            </select>
          </div>

          <div>
            <label for="filtro-estudiante">Estudiante</label>
            <select id="filtro-estudiante" v-model="filtros.estudiante">
              <option value="todos">Todos los estudiantes</option>
              <option v-for="n in estudiantesUnicos" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>

          <div>
            <label for="filtro-fase">Fase</label>
            <select id="filtro-fase" v-model="filtros.fase">
              <option value="todos">Todas las fases</option>
              <option value="Propuesta">Propuesta</option>
              <option value="Investigación">Investigación</option>
              <option value="Desarrollo">Desarrollo</option>
              <option value="Pruebas">Pruebas</option>
              <option value="Final">Final</option>
            </select>
          </div>

          <div>
            <label for="filtro-orden">Ordenar por</label>
            <select id="filtro-orden" v-model="filtros.orden">
              <option value="fecha-desc">Más recientes primero</option>
              <option value="fecha-asc">Más antiguas primero</option>
              <option value="estudiante">Por estudiante</option>
              <option value="fase">Por fase</option>
            </select>
          </div>
        </div>

        <button class="boton primario" id="aplicar-filtros" style="margin-top:15px;" @click="aplicarFiltros">Aplicar Filtros</button>
        <button class="boton secundario" id="limpiar-filtros" style="margin-top:15px;margin-left:10px;" @click="limpiarFiltros">Limpiar Filtros</button>
      </div>

      <div class="tarjeta">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2>📋 Entregas para Revisar</h2>
          <div><span id="contador-entregas">{{ entregasFiltradas.length }} entregas encontradas</span></div>
        </div>

        <div id="entregas-para-revisar" class="historial-entregas">
          <p v-if="!usuario">Cargando entregas...</p>
          <p v-else-if="entregasFiltradas.length === 0">No hay entregas con esos filtros.</p>

          <div v-else style="display:flex;flex-direction:column;gap:12px;">
            <div v-for="e in entregasFiltradas" :key="e.id" class="tarjeta" style="padding:12px;">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
                <div style="flex:1;">
                  <div style="font-weight:800;">{{ e.estudiante }} — {{ e.fase }}</div>
                  <div style="margin-top:4px;">{{ e.descripcion }}</div>
                  <div style="margin-top:6px;color:#666;font-size:.9em;">
                    <strong>Archivo:</strong> {{ e.archivo || "—" }} |
                    <strong>Estado:</strong> {{ e.estado }} |
                    <strong>Fecha:</strong> {{ e.fechaEntrega || e.fecha }}
                  </div>

                  <div v-if="e.observaciones" style="margin-top:6px;color:#444;">
                    <strong>Observaciones:</strong> {{ e.observaciones }}
                  </div>
                </div>

                <div style="min-width:260px;">
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <select v-model="acciones[e.id].estado">
                      <option value="revision">En revisión</option>
                      <option value="correccion">Requiere corrección</option>
                      <option value="aprobada">Aprobada</option>
                    </select>

                    <textarea
                      rows="2"
                      v-model.trim="acciones[e.id].observaciones"
                      placeholder="Observaciones para el estudiante..."
                    ></textarea>

                    <input
                      type="text"
                      v-model.trim="acciones[e.id].calificacion"
                      placeholder="Calificación (0-10) opcional"
                    />

                    <button class="boton primario" @click="guardarRevision(e)">Guardar revisión</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="tarjeta">
        <h2>📈 Estadísticas de Revisión</h2>
        <div id="estadisticas-revision">
          <p v-if="!usuario">Cargando estadísticas...</p>
          <div v-else style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">En revisión</div>
              <div style="font-size:1.4em;">{{ contarEstado("revision") }}</div>
            </div>
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">Corrección</div>
              <div style="font-size:1.4em;">{{ contarEstado("correccion") }}</div>
            </div>
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">Aprobadas</div>
              <div style="font-size:1.4em;">{{ contarEstado("aprobada") }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>💡 Guía de Revisión</h2>
        <div style="padding:15px;background-color:#f8f9fa;border-radius:8px;">
          <h4>Criterios de evaluación:</h4>
          <ul style="margin-top:10px;">
            <li>📝 <strong>Cumplimiento de requisitos:</strong> Verifica que se hayan cumplido todos los puntos solicitados</li>
            <li>🔍 <strong>Calidad del contenido:</strong> Revisa coherencia, profundidad y originalidad</li>
            <li>📚 <strong>Formato y presentación:</strong> Verifica que siga las instrucciones de formato</li>
            <li>⚡ <strong>Puntualidad:</strong> Considera si fue entregada dentro del plazo</li>
            <li>💬 <strong>Retroalimentación constructiva:</strong> Proporciona comentarios claros y útiles</li>
          </ul>
          <p style="margin-top:15px;color:#666;">
            <strong>Nota:</strong> Las calificaciones deben ser justificadas con observaciones claras.
          </p>
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
const toast = reactive({ visible: false, mensaje: "", icono: "ℹ️" });

const toastStyle = computed(() => ({
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 9999,
  background: "#4caf50",
  color: "white",
  padding: "12px 16px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  boxShadow: "0 2px 6px rgba(0,0,0,.2)",
}));

function mostrarToast(mensaje, tipo = "success") {
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
  if (!Array.isArray(datos.entregas)) datos.entregas = [];
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

const filtros = reactive({
  estado: "todos",
  estudiante: "todos",
  fase: "todos",
  orden: "fecha-desc",
});

const entregas = computed(() => {
  const d = obtenerDatos();
  if (!usuario.value) return [];
  return d.entregas.filter((e) => e.tutor === usuario.value.nombre);
});

const estudiantesUnicos = computed(() => {
  const set = new Set(entregas.value.map((e) => e.estudiante));
  return Array.from(set).sort();
});

const entregasFiltradas = ref([]);

const acciones = reactive({});

function inicializarAcciones(lista) {
  lista.forEach((e) => {
    if (!acciones[e.id]) {
      acciones[e.id] = {
        estado: e.estado || "revision",
        observaciones: e.observaciones || "",
        calificacion: e.calificacion || "",
      };
    }
  });
}

function ordenar(lista) {
  const copia = [...lista];
  if (filtros.orden === "fecha-desc") {
    copia.sort((a, b) => new Date(b.fechaEntrega || b.fecha) - new Date(a.fechaEntrega || a.fecha));
  } else if (filtros.orden === "fecha-asc") {
    copia.sort((a, b) => new Date(a.fechaEntrega || a.fecha) - new Date(b.fechaEntrega || b.fecha));
  } else if (filtros.orden === "estudiante") {
    copia.sort((a, b) => (a.estudiante || "").localeCompare(b.estudiante || ""));
  } else if (filtros.orden === "fase") {
    copia.sort((a, b) => (a.fase || "").localeCompare(b.fase || ""));
  }
  return copia;
}

function aplicarFiltros() {
  let lista = entregas.value;

  if (filtros.estado !== "todos") lista = lista.filter((e) => e.estado === filtros.estado);
  if (filtros.estudiante !== "todos") lista = lista.filter((e) => e.estudiante === filtros.estudiante);
  if (filtros.fase !== "todos") lista = lista.filter((e) => e.fase === filtros.fase);

  lista = ordenar(lista);
  entregasFiltradas.value = lista;
  inicializarAcciones(lista);
}

function limpiarFiltros() {
  filtros.estado = "todos";
  filtros.estudiante = "todos";
  filtros.fase = "todos";
  filtros.orden = "fecha-desc";
  aplicarFiltros();
}

function validarCalificacion(valor) {
  if (!valor) return true;
  const n = Number(valor);
  return !Number.isNaN(n) && n >= 0 && n <= 10;
}

function guardarRevision(entrega) {
  const act = acciones[entrega.id];
  if (!act) return;

  if (act.estado !== "revision" && (!act.observaciones || act.observaciones.trim().length < 5)) {
    mostrarToast("Las observaciones son requeridas (mínimo 5 caracteres)", "error");
    return;
  }

  if (!validarCalificacion(act.calificacion)) {
    mostrarToast("La calificación debe ser un número entre 0 y 10", "error");
    return;
  }

  const d = obtenerDatos();
  const idx = d.entregas.findIndex((x) => String(x.id) === String(entrega.id));
  if (idx === -1) {
    mostrarToast("No se encontró la entrega", "error");
    return;
  }

  d.entregas[idx].estado = act.estado;
  d.entregas[idx].observaciones = (act.observaciones || "").trim();
  d.entregas[idx].calificacion = (act.calificacion || "").trim();

  guardarDatos(d);

  if (act.estado === "aprobada") {
    notificarEstudiante(entrega.estudiante, `✅ Tu entrega (${entrega.fase}) fue aprobada.`, "entrega_aprobada");
  } else if (act.estado === "correccion") {
    notificarEstudiante(entrega.estudiante, `📝 Tu entrega (${entrega.fase}) requiere corrección: ${d.entregas[idx].observaciones}`, "entrega_corregida");
  } else {
    notificarEstudiante(entrega.estudiante, `📤 Tu entrega (${entrega.fase}) está en revisión.`, "entrega_revision");
  }

  mostrarToast("Revisión guardada", "success");
  aplicarFiltros();
}

function contarEstado(estado) {
  return entregas.value.filter((e) => e.estado === estado).length;
}

onMounted(() => {
  usuario.value = obtenerUsuarioActual();
  aplicarFiltros();
});
</script>

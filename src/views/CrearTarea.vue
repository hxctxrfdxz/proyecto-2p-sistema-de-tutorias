<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor">
      <div class="tarjeta">
        <h1>📝 Crear Nueva Tarea</h1>
        <div id="info-crear-tarea">
          <p>Sistema de Gestión de Tutorías de Titulación - ULEAM</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>🆕 Nueva Tarea</h2>

          <form id="formularioCrearTarea" novalidate @submit.prevent="crearTarea">
            <div class="grupo-formulario">
              <label for="tarea-estudiante">Estudiante *</label>
              <select id="tarea-estudiante" v-model="form.estudianteId" required>
                <option value="">-- Seleccionar estudiante --</option>
                <option v-for="e in estudiantesDisponibles" :key="e.id" :value="String(e.id)">
                  {{ e.nombre }}
                </option>
              </select>
              <small>Selecciona el estudiante al que asignarás esta tarea</small>
            </div>

            <div class="grupo-formulario">
              <label for="tarea-titulo">Título de la Tarea *</label>
              <input
                id="tarea-titulo"
                type="text"
                v-model.trim="form.titulo"
                placeholder="Ej: Avance del capítulo 2, Propuesta inicial, etc."
                maxlength="150"
                required
                @input="actualizarVistaPrevia"
              />
              <small>Nombre descriptivo de la tarea</small>
            </div>

            <div class="grupo-formulario">
              <label for="tarea-descripcion">Descripción *</label>
              <textarea
                id="tarea-descripcion"
                rows="4"
                v-model.trim="form.descripcion"
                placeholder="Describe detalladamente lo que debe realizar el estudiante..."
                required
                @input="actualizarVistaPrevia"
              ></textarea>
              <small>Incluye todos los requisitos y especificaciones</small>
            </div>

            <div class="grupo-formulario">
              <label for="tarea-fase">Fase del Proyecto *</label>
              <select id="tarea-fase" v-model="form.fase" required @change="actualizarVistaPrevia">
                <option value="">-- Seleccionar fase --</option>
                <option value="Propuesta">📋 Propuesta</option>
                <option value="Investigación">🔍 Investigación</option>
                <option value="Desarrollo">💻 Desarrollo</option>
                <option value="Pruebas">🧪 Pruebas</option>
                <option value="Final">🏁 Final</option>
                <option value="Otro">📝 Otro</option>
              </select>
              <small>Fase correspondiente de la titulación</small>
            </div>

            <div class="grupo-formulario">
              <label for="tarea-fecha">Fecha Límite *</label>
              <input id="tarea-fecha" type="date" v-model="form.fechaLimite" required @change="actualizarVistaPrevia" />
              <small>Fecha máxima para entregar la tarea</small>
            </div>

            <div class="grupo-formulario">
              <label for="tarea-hora">Hora Límite *</label>
              <input id="tarea-hora" type="time" v-model="form.hora" required @change="actualizarVistaPrevia" />
              <small>Hora específica para la entrega</small>
            </div>

            <div class="grupo-formulario">
              <label for="tarea-observaciones">Observaciones (opcional)</label>
              <textarea
                id="tarea-observaciones"
                rows="2"
                v-model.trim="form.observaciones"
                placeholder="Observaciones adicionales para el estudiante..."
                @input="actualizarVistaPrevia"
              ></textarea>
            </div>

            <div class="grupo-formulario">
              <label for="tarea-archivo">Archivo adjunto (opcional)</label>
              <input id="tarea-archivo" type="file" @change="onArchivo" />
              <small>Formatos permitidos: PDF, DOC, DOCX, ZIP, RAR, PPTX, XLSX (máx. 10MB)</small>
              <div id="info-archivo-tarea" style="margin-top:6px;color:#666;font-size:.9em;">
                {{ archivoInfo }}
              </div>
            </div>

            <p class="alertas" id="tarea-alerta">{{ alerta }}</p>

            <div style="display:flex;gap:10px;margin-top:20px;">
              <button class="boton primario" type="submit">✅ Crear Tarea</button>
              <button class="boton secundario" type="reset" @click="limpiar">🔄 Limpiar</button>
              <button class="boton" type="button" id="btn-guardar-borrador" @click="guardarBorrador">
                💾 Guardar borrador
              </button>
            </div>
          </form>
        </div>

        <div class="tarjeta">
          <h2>👤 Información del Estudiante</h2>
          <div id="info-estudiante-tarea">
            <p v-if="!estudianteSeleccionado" style="text-align:center;color:#666;padding:20px;">
              Selecciona un estudiante para ver su información
            </p>

            <div v-else>
              <p><strong>Nombre:</strong> {{ estudianteSeleccionado.nombre }}</p>
              <p><strong>Correo:</strong> {{ estudianteSeleccionado.correo }}</p>
              <p><strong>Tema:</strong> {{ estudianteSeleccionado.tema || "—" }}</p>
              <p><strong>Tutor:</strong> {{ estudianteSeleccionado.tutor || "—" }}</p>
            </div>
          </div>

          <div id="tareas-previas-estudiante" style="margin-top:20px;" v-if="estudianteSeleccionado">
            <h4>📋 Tareas anteriores</h4>
            <div id="lista-tareas-estudiante">
              <p v-if="tareasPrevias.length === 0">No hay tareas previas.</p>
              <div v-else style="display:flex;flex-direction:column;gap:10px;">
                <div v-for="t in tareasPrevias.slice(0,5)" :key="t.id" class="tarjeta" style="padding:10px;">
                  <div style="font-weight:700;">{{ t.titulo }}</div>
                  <div style="margin-top:4px;color:#666;">{{ t.fase }} — {{ t.fechaLimite }} {{ t.hora }}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="tarjeta" style="margin-top:20px;">
        <h2>👁️ Vista Previa de la Tarea</h2>
        <div id="vista-previa-tarea">
          <p v-if="!vistaPreviaListo" style="text-align:center;color:#666;padding:20px;font-style:italic;">
            La vista previa aparecerá aquí mientras completas el formulario
          </p>

          <div v-else class="tarjeta" style="padding:12px;">
            <div style="font-weight:800;font-size:1.1em;">{{ vistaPrevia.titulo }}</div>
            <div style="margin-top:6px;color:#666;">
              <strong>Fase:</strong> {{ vistaPrevia.fase }} |
              <strong>Fecha límite:</strong> {{ vistaPrevia.fechaLimite }} {{ vistaPrevia.hora }}
            </div>
            <div style="margin-top:10px;">{{ vistaPrevia.descripcion }}</div>
            <div v-if="vistaPrevia.observaciones" style="margin-top:10px;color:#555;">
              <strong>Observaciones:</strong> {{ vistaPrevia.observaciones }}
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta" style="margin-top:20px;">
        <h2>📊 Estadísticas de Tareas</h2>
        <div id="estadisticas-tareas">
          <p v-if="!usuario">Cargando estadísticas...</p>
          <div v-else style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">Total tareas</div>
              <div style="font-size:1.4em;">{{ datos.tareas.length }}</div>
            </div>
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">Creadas por mí</div>
              <div style="font-size:1.4em;">{{ tareasMias.length }}</div>
            </div>
            <div class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">Activas</div>
              <div style="font-size:1.4em;">{{ tareasActivas.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta" style="margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
          <h2 style="margin:0;">📅 Tareas Asignadas Recientemente</h2>
          <button class="boton boton-pequeno" id="btn-actualizar-tareas" @click="refrescar">
            🔄 Actualizar
          </button>
        </div>
        <div id="tareas-recientes" class="contenedor-tabla">
          <p v-if="tareasRecientes.length === 0">No hay tareas recientes.</p>
          <div v-else class="contenedor-tabla">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">Título</th>
                  <th style="text-align:left;padding:8px;">Estudiante</th>
                  <th style="text-align:left;padding:8px;">Fase</th>
                  <th style="text-align:left;padding:8px;">Límite</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in tareasRecientes" :key="t.id">
                  <td style="padding:8px;">{{ t.titulo }}</td>
                  <td style="padding:8px;">{{ t.estudiante }}</td>
                  <td style="padding:8px;">{{ t.fase }}</td>
                  <td style="padding:8px;">{{ t.fechaLimite }} {{ t.hora }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tarjeta" style="margin-top:20px;">
        <h2>⏰ Próximas Fechas Límite</h2>
        <div id="proximas-fechas">
          <p v-if="proximasFechas.length === 0">No hay próximas fechas límite.</p>
          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div v-for="t in proximasFechas" :key="t.id" class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">{{ t.titulo }}</div>
              <div style="margin-top:6px;color:#666;">{{ t.estudiante }} — {{ t.fechaLimite }} {{ t.hora }}</div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import BarraNavegacion from "../components/BarraNavegacion.vue";
import { manejadorAutenticacion } from "../scripts/core/autenticacion";
import { obtenerDatos, guardarDatos, generarId, obtenerFechaActual } from "../scripts/core/datos";

const usuario = ref(null);
const alerta = ref("");
const archivoInfo = ref("");
const archivoAdjunto = ref(null);

const form = reactive({
  estudianteId: "",
  titulo: "",
  descripcion: "",
  fase: "",
  fechaLimite: "",
  hora: "",
  observaciones: "",
});

const vistaPrevia = reactive({
  titulo: "",
  descripcion: "",
  fase: "",
  fechaLimite: "",
  hora: "",
  observaciones: "",
});

const vistaPreviaListo = computed(() =>
  Boolean(form.titulo || form.descripcion || form.fase || form.fechaLimite || form.hora || form.observaciones)
);

const datos = computed(() => {
  const d = obtenerDatos();
  if (!d.notificaciones) d.notificaciones = { estudiante: [], tutor: [], administrador: [] };
  if (!Array.isArray(d.usuarios)) d.usuarios = [];
  if (!Array.isArray(d.estudiantes)) d.estudiantes = [];
  if (!Array.isArray(d.tutores)) d.tutores = [];
  if (!Array.isArray(d.tareas)) d.tareas = [];
  if (!Array.isArray(d.entregas)) d.entregas = [];
  if (!Array.isArray(d.temas)) d.temas = [];
  return d;
});

function validarTextoMin(valor, min) {
  return typeof valor === "string" && valor.trim().length >= min;
}

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

function validarArchivo(file) {
  if (!file) return { valido: true };
  const permitidos = ["pdf", "doc", "docx", "zip", "rar", "pptx", "xlsx"];
  const ext = file.name.split(".").pop().toLowerCase();
  if (!permitidos.includes(ext)) return { valido: false, mensaje: "Tipo de archivo no permitido" };
  const max = 10 * 1024 * 1024;
  if (file.size > max) return { valido: false, mensaje: "El archivo supera 10MB" };
  return { valido: true };
}

const estudiantesDisponibles = computed(() => datos.value.estudiantes);

const estudianteSeleccionado = computed(() => {
  const id = Number(form.estudianteId);
  return datos.value.estudiantes.find((e) => Number(e.id) === id) || null;
});

const tareasPrevias = computed(() => {
  if (!estudianteSeleccionado.value) return [];
  return (datos.value.tareas || []).filter((t) => t.estudiante === estudianteSeleccionado.value.nombre);
});

const tareasMias = computed(() => {
  if (!usuario.value) return [];
  return (datos.value.tareas || []).filter((t) => String(t.tutorId) === String(usuario.value.id));
});

const tareasActivas = computed(() =>
  (datos.value.tareas || []).filter((t) => String(t.estado || "").toLowerCase() === "activa")
);

const tareasRecientes = computed(() => {
  return [...(datos.value.tareas || [])]
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    .slice(0, 8);
});

const proximasFechas = computed(() => {
  const lista = [...(datos.value.tareas || [])]
    .filter((t) => t.fechaLimite)
    .sort(
      (a, b) =>
        new Date(`${a.fechaLimite}T${a.hora || "23:59"}`) - new Date(`${b.fechaLimite}T${b.hora || "23:59"}`)
    );
  return lista.slice(0, 6);
});

function actualizarVistaPrevia() {
  vistaPrevia.titulo = form.titulo;
  vistaPrevia.descripcion = form.descripcion;
  vistaPrevia.fase = form.fase;
  vistaPrevia.fechaLimite = form.fechaLimite;
  vistaPrevia.hora = form.hora;
  vistaPrevia.observaciones = form.observaciones;
}

function onArchivo(e) {
  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
  archivoAdjunto.value = file;
  archivoInfo.value = file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : "";
}

function notificarEstudiante(nombreEstudiante, mensaje, tipo) {
  const d = obtenerDatos();
  if (!d.notificaciones) d.notificaciones = { estudiante: [], tutor: [], administrador: [] };
  d.notificaciones.estudiante.push({
    id: generarId(),
    tipo,
    mensaje,
    fecha: obtenerFechaActual(),
    leida: false,
    paraUsuario: nombreEstudiante,
  });
  guardarDatos(d);
}

function crearTarea() {
  alerta.value = "";
  const errores = [];

  if (!usuario.value || !usuario.value.id) {
    alerta.value = "❌ No hay sesión activa";
    return;
  }

  if (!form.estudianteId) errores.push("Debe seleccionar un estudiante");
  if (!validarTextoMin(form.titulo, 5)) errores.push("El título es requerido (mínimo 5 caracteres)");
  if (!validarTextoMin(form.descripcion, 10)) errores.push("La descripción es requerida (mínimo 10 caracteres)");
  if (!form.fase) errores.push("Debe seleccionar una fase");
  if (!form.fechaLimite) errores.push("Debe seleccionar fecha límite");
  else if (!validarFechaFutura(form.fechaLimite)) errores.push("La fecha límite debe ser hoy o futura");
  if (!form.hora) errores.push("Debe seleccionar hora límite");
  else if (!validarHoraFutura(form.fechaLimite, form.hora)) errores.push("La fecha y hora deben ser futuras");

  const va = validarArchivo(archivoAdjunto.value);
  if (!va.valido) errores.push(va.mensaje);

  if (errores.length) {
    alerta.value = "❌ " + errores.join(". ");
    return;
  }

  const d = obtenerDatos();
  const est = (d.estudiantes || []).find((e) => String(e.id) === String(form.estudianteId));
  if (!est) {
    alerta.value = "❌ Estudiante no encontrado";
    return;
  }

  const nueva = {
    id: generarId(),
    tutorId: usuario.value.id,
    tutor: usuario.value.nombre || "",
    estudianteId: Number(est.id),
    estudiante: est.nombre,
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim(),
    fase: form.fase,
    fechaLimite: form.fechaLimite,
    hora: form.hora,
    fechaCreacion: obtenerFechaActual(),
    estado: "activa",
    archivo: archivoAdjunto.value ? archivoAdjunto.value.name : "",
    observaciones: (form.observaciones || "").trim(),
  };

  if (!Array.isArray(d.tareas)) d.tareas = [];
  d.tareas.push(nueva);
  guardarDatos(d);

  notificarEstudiante(
    est.nombre,
    `📝 ${nueva.tutor} te ha asignado una nueva tarea: "${nueva.titulo}" (${nueva.fase}) - Fecha límite: ${nueva.fechaLimite} a las ${nueva.hora}`,
    "nueva_tarea"
  );

  alerta.value = "✅ Tarea creada correctamente";
  limpiar();
  refrescar();
}

function guardarBorrador() {
  localStorage.setItem("borradorTarea", JSON.stringify({ ...form }));
  alerta.value = "✅ Borrador guardado";
}

function cargarBorrador() {
  const raw = localStorage.getItem("borradorTarea");
  if (!raw) return;
  const b = JSON.parse(raw);
  form.estudianteId = b.estudianteId || "";
  form.titulo = b.titulo || "";
  form.descripcion = b.descripcion || "";
  form.fase = b.fase || "";
  form.fechaLimite = b.fechaLimite || "";
  form.hora = b.hora || "";
  form.observaciones = b.observaciones || "";
  actualizarVistaPrevia();
}

function limpiar() {
  form.estudianteId = "";
  form.titulo = "";
  form.descripcion = "";
  form.fase = "";
  form.fechaLimite = "";
  form.hora = "";
  form.observaciones = "";
  archivoInfo.value = "";
  archivoAdjunto.value = null;
  actualizarVistaPrevia();
}

function refrescar() {
  alerta.value = alerta.value;
}

onMounted(() => {
  usuario.value = manejadorAutenticacion.obtenerUsuario();
  cargarBorrador();
  actualizarVistaPrevia();
});
</script>

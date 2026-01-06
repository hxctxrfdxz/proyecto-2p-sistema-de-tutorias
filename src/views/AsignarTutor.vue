<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor">
      <div class="tarjeta">
        <h1>👨‍🏫 Asignar Tutor a Estudiante</h1>
        <div id="info-asignacion">
          <p>Sistema de Gestión de Tutorías de Titulación - ULEAM</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>📝 Seleccionar Estudiante y Tutor</h2>

          <form id="formularioAsignarTutor" novalidate @submit.prevent="asignar">
            <div class="grupo-formulario">
              <label for="asignar-estudiante">Estudiante *</label>
              <select id="asignar-estudiante" v-model="form.estudianteId" required @change="cargarInfoEstudiante">
                <option value="">-- Seleccionar estudiante --</option>
                <option v-for="e in estudiantes" :key="e.id" :value="String(e.id)">
                  {{ e.nombre }}
                </option>
              </select>
              <small>Estudiante al que se asignará el tutor</small>
            </div>

            <div class="grupo-formulario">
              <label for="asignar-tutor">Tutor *</label>
              <select id="asignar-tutor" v-model="form.tutorId" required @change="cargarInfoTutor">
                <option value="">-- Seleccionar tutor --</option>
                <option v-for="t in tutores" :key="t.id" :value="String(t.id)">
                  {{ t.nombre }}
                </option>
              </select>
              <small>Tutor que será asignado al estudiante</small>
            </div>

            <div class="grupo-formulario">
              <label for="asignar-razon">Razón de la asignación (opcional)</label>
              <textarea id="asignar-razon" rows="3" v-model.trim="form.razon" placeholder="Motivo de la asignación, especialidad requerida, etc..."></textarea>
            </div>

            <p class="alertas" id="asignacion-alerta">{{ alerta }}</p>

            <div style="display:flex;gap:10px;margin-top:20px;">
              <button class="boton primario" type="submit">✅ Asignar Tutor</button>
              <button class="boton secundario" type="reset" @click="limpiar">🔄 Limpiar</button>
              <button class="boton" type="button" id="btn-cambiar-tutor" @click="cambiarTutor">
                🔄 Cambiar Tutor
              </button>
            </div>
          </form>
        </div>

        <div class="tarjeta">
          <h2>👤 Información del Estudiante</h2>

          <div id="info-estudiante-asignacion">
            <p v-if="!estudianteSel" style="text-align:center;color:#666;padding:20px;">
              Selecciona un estudiante para ver su información
            </p>
            <div v-else>
              <p><strong>Nombre:</strong> {{ estudianteSel.nombre }}</p>
              <p><strong>Correo:</strong> {{ estudianteSel.correo }}</p>
              <p><strong>Tema:</strong> {{ estudianteSel.tema || "—" }}</p>
              <p><strong>Estado:</strong> {{ estudianteSel.estado || "Activo" }}</p>
            </div>
          </div>

          <div id="tutor-actual-estudiante" style="margin-top:20px;" v-if="estudianteSel">
            <h4>👨‍🏫 Tutor actual</h4>
            <div id="info-tutor-actual">
              <p v-if="!estudianteSel.tutor">No tiene tutor asignado.</p>
              <p v-else>{{ estudianteSel.tutor }}</p>
            </div>
          </div>
        </div>

        <div class="tarjeta">
          <h2>📊 Información del Tutor</h2>

          <div id="info-tutor-seleccionado">
            <p v-if="!tutorSel" style="text-align:center;color:#666;padding:20px;">
              Selecciona un tutor para ver su información
            </p>
            <div v-else>
              <p><strong>Nombre:</strong> {{ tutorSel.nombre }}</p>
              <p><strong>Correo:</strong> {{ tutorSel.correo }}</p>
              <p><strong>Estado:</strong> {{ tutorSel.estado || "Disponible" }}</p>
              <p><strong>Estudiantes asignados:</strong> {{ (tutorSel.estudiantes || []).length }}</p>
            </div>
          </div>

          <div id="estudiantes-tutor" style="margin-top:20px;" v-if="tutorSel">
            <h4>👥 Estudiantes actuales</h4>
            <div id="lista-estudiantes-tutor">
              <p v-if="estudiantesTutor.length === 0">No tiene estudiantes asignados.</p>
              <ul v-else style="margin:0;padding-left:18px;">
                <li v-for="n in estudiantesTutor" :key="n">{{ n }}</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      <div class="tarjeta" style="margin-top:20px;">
        <h2>📝 Estudiantes Sin Tutor</h2>
        <div id="estudiantes-sin-tutor" class="contenedor-tabla">
          <p v-if="sinTutor.length === 0">No hay estudiantes sin tutor.</p>
          <div v-else class="contenedor-tabla">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">Nombre</th>
                  <th style="text-align:left;padding:8px;">Correo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in sinTutor" :key="e.id">
                  <td style="padding:8px;">{{ e.nombre }}</td>
                  <td style="padding:8px;">{{ e.correo }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tarjeta" style="margin-top:20px;">
        <h2>👨‍🏫 Tutores Disponibles</h2>
        <div id="tutores-disponibles" class="contenedor-tabla">
          <p v-if="tutores.length === 0">No hay tutores.</p>
          <div v-else class="contenedor-tabla">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">Tutor</th>
                  <th style="text-align:left;padding:8px;">Correo</th>
                  <th style="text-align:left;padding:8px;">Estudiantes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in tutores" :key="t.id">
                  <td style="padding:8px;">{{ t.nombre }}</td>
                  <td style="padding:8px;">{{ t.correo }}</td>
                  <td style="padding:8px;">{{ (t.estudiantes || []).length }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tarjeta" style="margin-top:20px;">
        <h2>📋 Historial de Asignaciones</h2>
        <div id="historial-asignaciones" class="contenedor-tabla">
          <p v-if="historial.length === 0">No hay historial.</p>
          <div v-else class="contenedor-tabla">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">Fecha</th>
                  <th style="text-align:left;padding:8px;">Estudiante</th>
                  <th style="text-align:left;padding:8px;">Tutor</th>
                  <th style="text-align:left;padding:8px;">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in historial.slice().reverse().slice(0,12)" :key="h.id">
                  <td style="padding:8px;">{{ h.fecha }}</td>
                  <td style="padding:8px;">{{ h.estudiante }}</td>
                  <td style="padding:8px;">{{ h.tutor }}</td>
                  <td style="padding:8px;">{{ h.accion }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import BarraNavegacion from "../components/BarraNavegacion.vue";

const alerta = ref("");
const form = reactive({ estudianteId: "", tutorId: "", razon: "" });

const estudianteSel = ref(null);
const tutorSel = ref(null);

function obtenerDatos() {
  const raw = localStorage.getItem("datosUleam");
  const datos = raw ? JSON.parse(raw) : {};
  if (!datos.notificaciones) datos.notificaciones = { estudiante: [], tutor: [], administrador: [] };
  if (!Array.isArray(datos.estudiantes)) datos.estudiantes = [];
  if (!Array.isArray(datos.tutores)) datos.tutores = [];
  if (!Array.isArray(datos.historialAsignaciones)) datos.historialAsignaciones = [];
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

const datos = computed(() => obtenerDatos());
const estudiantes = computed(() => datos.value.estudiantes);
const tutores = computed(() => datos.value.tutores);
const historial = computed(() => datos.value.historialAsignaciones || []);

const sinTutor = computed(() => estudiantes.value.filter((e) => !e.tutor));

const estudiantesTutor = computed(() => {
  if (!tutorSel.value) return [];
  const ids = tutorSel.value.estudiantes || [];
  return estudiantes.value.filter((e) => ids.includes(e.id)).map((e) => e.nombre);
});

function cargarInfoEstudiante() {
  const d = obtenerDatos();
  estudianteSel.value = d.estudiantes.find((e) => String(e.id) === String(form.estudianteId)) || null;
}

function cargarInfoTutor() {
  const d = obtenerDatos();
  tutorSel.value = d.tutores.find((t) => String(t.id) === String(form.tutorId)) || null;
}

function validar() {
  const errores = [];
  if (!form.estudianteId) errores.push("Debe seleccionar un estudiante");
  if (!form.tutorId) errores.push("Debe seleccionar un tutor");
  return errores;
}

function asignar() {
  alerta.value = "";
  const errores = validar();
  if (errores.length) {
    alerta.value = "❌ " + errores.join(". ");
    return;
  }

  const d = obtenerDatos();
  const est = d.estudiantes.find((e) => String(e.id) === String(form.estudianteId));
  const tut = d.tutores.find((t) => String(t.id) === String(form.tutorId));

  if (!est || !tut) {
    alerta.value = "❌ No se encontró estudiante o tutor";
    return;
  }

  const tutorAnterior = est.tutor || "";
  est.tutor = tut.nombre;

  if (!Array.isArray(tut.estudiantes)) tut.estudiantes = [];
  if (!tut.estudiantes.includes(est.id)) tut.estudiantes.push(est.id);

  d.historialAsignaciones.push({
    id: generarId(),
    fecha: hoyISO(),
    estudiante: est.nombre,
    tutor: tut.nombre,
    accion: tutorAnterior ? "Cambio" : "Asignación",
    razon: (form.razon || "").trim(),
  });

  guardarDatos(d);

  notificarTutor(tut.nombre, `📅 Se te asignó el estudiante ${est.nombre}`, "asignacion_estudiante");
  notificarEstudiante(est.nombre, `👨‍🏫 Se te asignó el tutor ${tut.nombre}`, "tutor_asignado");

  alerta.value = "✅ Tutor asignado correctamente";
  cargarInfoEstudiante();
  cargarInfoTutor();
}

function cambiarTutor() {
  if (!form.estudianteId || !form.tutorId) {
    alerta.value = "❌ Selecciona estudiante y nuevo tutor";
    return;
  }
  asignar();
}

function limpiar() {
  form.estudianteId = "";
  form.tutorId = "";
  form.razon = "";
  estudianteSel.value = null;
  tutorSel.value = null;
  alerta.value = "";
}

onMounted(() => {
  cargarInfoEstudiante();
  cargarInfoTutor();
});
</script>

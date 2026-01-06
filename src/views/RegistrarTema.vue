<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor">
      <div class="tarjeta">
        <h1>📚 Registrar Tema de Titulación</h1>
        <div id="info-registro">
          <p>Sistema de Gestión de Tutorías de Titulación - ULEAM</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>📝 Asignar Tema a Estudiante</h2>

          <form id="formularioRegistrarTema" novalidate @submit.prevent="registrarTema">
            <div class="grupo-formulario">
              <label for="tema-estudiante">Estudiante *</label>
              <select id="tema-estudiante" v-model="form.estudianteId" required @change="cargarInfoEstudiante">
                <option value="">-- Seleccionar estudiante --</option>
                <option v-for="e in estudiantes" :key="e.id" :value="String(e.id)">
                  {{ e.nombre }}
                </option>
              </select>
              <small>Selecciona el estudiante al que se asignará el tema</small>
            </div>

            <div class="grupo-formulario">
              <label for="tema-titulo">Título del Tema *</label>
              <input
                id="tema-titulo"
                type="text"
                v-model.trim="form.titulo"
                placeholder='Ej: Sistema de gestión educativa basado en IA...'
                maxlength="200"
                required
              />
              <small>Nombre descriptivo del tema de titulación</small>
            </div>

            <div class="grupo-formulario">
              <label for="tema-descripcion">Descripción Detallada *</label>
              <textarea
                id="tema-descripcion"
                rows="5"
                v-model.trim="form.descripcion"
                placeholder="Describe el tema en detalle, objetivos, alcance, metodología sugerida..."
                required
              ></textarea>
              <small>Incluye información relevante para el desarrollo del proyecto</small>
            </div>

            <div class="grupo-formulario">
              <label for="tema-area">Área de Conocimiento *</label>
              <select id="tema-area" v-model="form.area" required>
                <option value="">-- Seleccionar área --</option>
                <option value="Ingeniería de Software">💻 Ingeniería de Software</option>
                <option value="Base de Datos">🗃️ Base de Datos</option>
                <option value="Redes y Telecomunicaciones">🌐 Redes y Telecomunicaciones</option>
                <option value="Inteligencia Artificial">🤖 Inteligencia Artificial</option>
                <option value="Sistemas de Información">📊 Sistemas de Información</option>
                <option value="Ciberseguridad">🔒 Ciberseguridad</option>
                <option value="Desarrollo Web">🕸️ Desarrollo Web</option>
                <option value="Desarrollo Móvil">📱 Desarrollo Móvil</option>
                <option value="Otra">📋 Otra área</option>
              </select>
              <small>Área principal del tema</small>
            </div>

            <div class="grupo-formulario">
              <label for="tema-dificultad">Nivel de Dificultad *</label>
              <select id="tema-dificultad" v-model="form.dificultad" required>
                <option value="">-- Seleccionar nivel --</option>
                <option value="Básico">🟢 Básico</option>
                <option value="Intermedio">🟡 Intermedio</option>
                <option value="Avanzado">🔴 Avanzado</option>
              </select>
              <small>Considera el tiempo estimado y complejidad</small>
            </div>

            <div class="grupo-formulario">
              <label for="tema-observaciones">Observaciones (opcional)</label>
              <textarea
                id="tema-observaciones"
                rows="2"
                v-model.trim="form.observaciones"
                placeholder="Observaciones adicionales sobre el tema..."
              ></textarea>
            </div>

            <p class="alertas" id="tema-alerta">{{ alerta }}</p>

            <div style="display:flex;gap:10px;margin-top:20px;">
              <button class="boton primario" type="submit">✅ Registrar Tema</button>
              <button class="boton secundario" type="reset" @click="limpiar">🔄 Limpiar</button>
            </div>
          </form>
        </div>

        <div class="tarjeta">
          <h2>👤 Información del Estudiante</h2>
          <div id="info-estudiante-seleccionado">
            <p v-if="!estudianteSel" style="text-align:center;color:#666;padding:20px;">
              Selecciona un estudiante para ver su información
            </p>

            <div v-else>
              <p><strong>Nombre:</strong> {{ estudianteSel.nombre }}</p>
              <p><strong>Correo:</strong> {{ estudianteSel.correo }}</p>
              <p><strong>Tutor:</strong> {{ estudianteSel.tutor || "—" }}</p>
              <p><strong>Tema actual:</strong> {{ estudianteSel.tema || "—" }}</p>
              <p><strong>Estado:</strong> {{ estudianteSel.estado || "pendiente" }}</p>
            </div>
          </div>

          <div id="temas-previos-estudiante" style="margin-top:20px;" v-if="estudianteSel">
            <h4>📚 Temas anteriores</h4>
            <div id="lista-temas-estudiante">
              <p v-if="temasPrevios.length === 0">No hay temas previos.</p>
              <div v-else style="display:flex;flex-direction:column;gap:10px;">
                <div v-for="t in temasPrevios.slice(0,5)" :key="t.id" class="tarjeta" style="padding:10px;">
                  <div style="font-weight:700;">{{ t.titulo }}</div>
                  <div style="color:#666;margin-top:4px;">
                    {{ t.area }} — {{ t.dificultad }} — {{ t.fechaRegistro }}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="tarjeta" style="margin-top:20px;">
        <h2>📋 Temas Registrados Recientemente</h2>
        <div id="temas-recientes" class="contenedor-tabla">
          <p v-if="temasRecientes.length === 0">No hay temas recientes.</p>
          <div v-else class="contenedor-tabla">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">Tema</th>
                  <th style="text-align:left;padding:8px;">Estudiante</th>
                  <th style="text-align:left;padding:8px;">Área</th>
                  <th style="text-align:left;padding:8px;">Dificultad</th>
                  <th style="text-align:left;padding:8px;">Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in temasRecientes" :key="t.id">
                  <td style="padding:8px;">{{ t.titulo }}</td>
                  <td style="padding:8px;">{{ t.estudiante }}</td>
                  <td style="padding:8px;">{{ t.area }}</td>
                  <td style="padding:8px;">{{ t.dificultad }}</td>
                  <td style="padding:8px;">{{ t.fechaRegistro }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tarjeta" style="margin-top:20px;">
        <h2>📝 Estudiantes Sin Tema Asignado</h2>
        <div id="estudiantes-sin-tema" class="contenedor-tabla">
          <p v-if="sinTema.length === 0">No hay estudiantes sin tema.</p>

          <div v-else class="contenedor-tabla">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:8px;">Nombre</th>
                  <th style="text-align:left;padding:8px;">Correo</th>
                  <th style="text-align:left;padding:8px;">Tutor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in sinTema" :key="e.id">
                  <td style="padding:8px;">{{ e.nombre }}</td>
                  <td style="padding:8px;">{{ e.correo }}</td>
                  <td style="padding:8px;">{{ e.tutor || "—" }}</td>
                </tr>
              </tbody>
            </table>
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

const alerta = ref("");
const estudianteSel = ref(null);

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

const form = reactive({
  estudianteId: "",
  titulo: "",
  descripcion: "",
  area: "",
  dificultad: "",
  observaciones: "",
});

function obtenerDatos() {
  const raw = localStorage.getItem("datosUleam");
  const datos = raw ? JSON.parse(raw) : {};
  if (!datos.notificaciones) datos.notificaciones = { estudiante: [], tutor: [], administrador: [] };
  if (!Array.isArray(datos.estudiantes)) datos.estudiantes = [];
  if (!Array.isArray(datos.temas)) datos.temas = [];
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

function validarTexto(valor, min, max) {
  if (!valor) return false;
  const v = valor.trim();
  return v.length >= min && v.length <= max;
}

function validarDescripcion(valor, min) {
  if (!valor) return false;
  return valor.trim().length >= min;
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
const temas = computed(() => datos.value.temas);

const sinTema = computed(() => estudiantes.value.filter((e) => !e.tema));

const temasRecientes = computed(() => {
  return [...temas.value].sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro)).slice(0, 10);
});

const temasPrevios = computed(() => {
  if (!estudianteSel.value) return [];
  return temas.value.filter((t) => t.estudiante === estudianteSel.value.nombre);
});

function cargarInfoEstudiante() {
  const d = obtenerDatos();
  estudianteSel.value = d.estudiantes.find((e) => String(e.id) === String(form.estudianteId)) || null;
}

function registrarTema() {
  alerta.value = "";
  const errores = [];

  if (!form.estudianteId) errores.push("Debe seleccionar un estudiante");
  if (!validarTexto(form.titulo, 10, 200)) errores.push("Título inválido (mín. 10, máx. 200)");
  if (!validarDescripcion(form.descripcion, 20)) errores.push("La descripción debe tener al menos 20 caracteres");
  if (!form.area) errores.push("Debe seleccionar un área");
  if (!form.dificultad) errores.push("Debe seleccionar dificultad");

  if (errores.length) {
    alerta.value = "❌ " + errores.join(". ");
    return;
  }

  const d = obtenerDatos();
  const est = d.estudiantes.find((e) => String(e.id) === String(form.estudianteId));
  if (!est) {
    alerta.value = "❌ Estudiante no encontrado";
    return;
  }

  const nuevoTema = {
    id: generarId(),
    estudiante: est.nombre,
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim(),
    area: form.area,
    dificultad: form.dificultad,
    observaciones: (form.observaciones || "").trim(),
    fechaRegistro: hoyISO(),
  };

  d.temas.push(nuevoTema);
  est.tema = nuevoTema.titulo;

  guardarDatos(d);

  notificarEstudiante(est.nombre, `📚 Se registró tu tema de titulación: "${nuevoTema.titulo}"`, "tema_registrado");

  alerta.value = "✅ Tema registrado correctamente";
  mostrarToast("Tema registrado", "success");

  limpiar();
  cargarInfoEstudiante();
}

function limpiar() {
  form.estudianteId = "";
  form.titulo = "";
  form.descripcion = "";
  form.area = "";
  form.dificultad = "";
  form.observaciones = "";
  estudianteSel.value = null;
}

onMounted(() => {});
</script>

<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor">
      <div class="tarjeta entregas">
        <h1>📤 Subir Entregas</h1>
        <div id="info-entregas">
          <p>{{ info }}</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>➕ Nueva Entrega</h2>
          <form id="formularioSubir" novalidate @submit.prevent="subir">
            <div class="grupo-formulario">
              <label for="entrega-fase">Fase del Proyecto *</label>
              <select id="entrega-fase" v-model="fase" required>
                <option value="">-- Selecciona la fase --</option>
                <option value="Propuesta">📝 Propuesta</option>
                <option value="Investigación">🔍 Investigación</option>
                <option value="Desarrollo">💻 Desarrollo</option>
                <option value="Pruebas">🧪 Pruebas</option>
                <option value="Final">✅ Final</option>
                <option value="Otro">📄 Otro</option>
              </select>
              <small>Selecciona la fase correspondiente a tu entrega</small>
            </div>

            <div class="grupo-formulario">
              <label for="entrega-titulo">Título de la entrega *</label>
              <input id="entrega-titulo" type="text" placeholder="Ej: Avance del capítulo 2, Propuesta inicial, etc." v-model.trim="titulo" required />
            </div>

            <div class="grupo-formulario">
              <label for="entrega-descripcion">Descripción detallada *</label>
              <textarea id="entrega-descripcion" rows="4" placeholder="Describe qué contiene tu entrega, qué avances presenta, etc..." v-model.trim="descripcion" required></textarea>
              <small>Incluye información relevante para tu tutor</small>
            </div>

            <div class="grupo-formulario">
              <label for="entrega-archivo">Seleccionar archivo *</label>
              <input id="entrega-archivo" type="file" accept=".pdf,.doc,.docx,.zip,.rar,.pptx,.xlsx" required @change="alArchivo" />
              <small>Formatos permitidos: PDF, Word (DOC/DOCX), PowerPoint, Excel, ZIP, RAR (Máx. 10MB)</small>
              <div id="info-archivo" style="margin-top:5px;font-size:.9em;color:#666;">{{ infoArchivo }}</div>
            </div>

            <div class="grupo-formulario">
              <label for="entrega-comentarios">Comentarios adicionales (opcional)</label>
              <textarea id="entrega-comentarios" rows="2" placeholder="Agrega cualquier comentario o observación adicional..." v-model.trim="comentarios"></textarea>
            </div>

            <p class="alertas" id="entrega-alerta">{{ alerta }}</p>
            <button class="boton primario" type="submit">Subir Entrega</button>
            <button class="boton secundario" type="reset" style="margin-left:10px;" @click="limpiar">Limpiar</button>
          </form>
        </div>

        <div class="tarjeta">
          <h2>📋 Tareas Pendientes</h2>
          <div id="tareas-pendientes">
            <p v-if="tareasPendientes.length === 0">No tienes tareas pendientes.</p>
            <div v-else style="display:flex;flex-direction:column;gap:10px;">
              <div v-for="t in tareasPendientes" :key="t.id" class="tarjeta" style="padding:12px;">
                <div style="font-weight:700;">{{ t.titulo }}</div>
                <div style="color:#666;margin-top:6px;">Fase: {{ t.fase }} | Límite: {{ t.fechaLimite }} {{ t.hora }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📚 Historial de Entregas</h2>
        <div id="mis-entregas" class="historial-entregas">
          <p v-if="misEntregas.length === 0">Aún no has subido entregas.</p>
          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div v-for="e in misEntregas" :key="e.id" class="tarjeta" style="padding:12px;">
              <div style="display:flex;justify-content:space-between;gap:10px;">
                <div>
                  <div style="font-weight:700;">{{ e.titulo }}</div>
                  <div style="color:#666;margin-top:6px;">Fase: {{ e.fase }} | Fecha: {{ e.fechaEntrega }}</div>
                  <div style="color:#666;margin-top:6px;">Archivo: {{ e.archivo }}</div>
                </div>
                <div>Estado: {{ e.estado }}</div>
              </div>
              <div v-if="e.observaciones" style="margin-top:10px;color:#444;">Observaciones: {{ e.observaciones }}</div>
              <div v-if="e.calificacion" style="margin-top:6px;color:#444;">Calificación: {{ e.calificacion }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>ℹ️ Instrucciones para Entregas</h2>
        <div style="padding:15px;background-color:#f8f9fa;border-radius:8px;">
          <h4>Requisitos de entrega:</h4>
          <ul style="margin-top:10px;">
            <li>Los archivos deben tener nombres descriptivos (ej: propuesta_estudiante_fecha.pdf)</li>
            <li>Tamaño máximo por archivo: 10MB</li>
            <li>Formatos aceptados: PDF, Word, PowerPoint, Excel, ZIP, RAR</li>
            <li>Incluir siempre una descripción clara de lo que se entrega</li>
            <li>Las entregas se revisan en un plazo de 3-5 días hábiles</li>
            <li>Puedes subir múltiples versiones de la misma fase si es necesario</li>
          </ul>
          <p style="margin-top:15px;color:#666;">
            <strong>Nota:</strong> Tu tutor te notificará cuando revise tu entrega.
            Revisa regularmente tus notificaciones para ver los comentarios y calificaciones.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import BarraNavegacion from "../components/BarraNavegacion.vue";
import { manejadorAutenticacion } from "../scripts/core/autenticacion";
import { obtenerDatos, guardarDatos, generarId, obtenerFechaActual } from "../scripts/core/datos";
import { Utilidades } from "../scripts/utils/utilidades";
import { Validador } from "../scripts/core/validaciones";

const info = ref("");
const tareasPendientes = ref([]);
const misEntregas = ref([]);

const fase = ref("");
const titulo = ref("");
const descripcion = ref("");
const comentarios = ref("");
const archivo = ref(null);
const infoArchivo = ref("");
const alerta = ref("");

function cargar() {
  const u = manejadorAutenticacion.obtenerUsuario();
  const datos = obtenerDatos();

  const est = (datos.estudiantes || []).find((e) => String(e.id) === String(u.id));
  info.value = est ? `Tutor asignado: ${est.tutor || "No asignado"}` : "Cargando información de entregas...";

  const tareas = (datos.tareas || []).filter((t) => String(t.estudianteId) === String(u.id));
  tareasPendientes.value = tareas
    .filter((t) => String(t.estado || "").toLowerCase() === "activa")
    .slice()
    .sort((a, b) => new Date(`${a.fechaLimite}T${a.hora}`) - new Date(`${b.fechaLimite}T${b.hora}`));

  misEntregas.value = (datos.entregas || [])
    .filter((e) => String(e.estudianteId) === String(u.id))
    .slice()
    .sort((a, b) => new Date(b.fechaEntrega) - new Date(a.fechaEntrega));
}

function alArchivo(e) {
  archivo.value = e.target.files && e.target.files[0] ? e.target.files[0] : null;
  infoArchivo.value = archivo.value ? `${archivo.value.name} (${Math.round(archivo.value.size / 1024)} KB)` : "";
}

function limpiar() {
  fase.value = "";
  titulo.value = "";
  descripcion.value = "";
  comentarios.value = "";
  archivo.value = null;
  infoArchivo.value = "";
  alerta.value = "";
}

function subir() {
  alerta.value = "";
  const u = manejadorAutenticacion.obtenerUsuario();
  const datos = obtenerDatos();

  const est = (datos.estudiantes || []).find((e) => String(e.id) === String(u.id));
  if (!est || !est.tutor) {
    alerta.value = "No tienes tutor asignado. Solicita asignación al administrador.";
    Utilidades.mostrarToast(alerta.value, "warning");
    return;
  }

  const errores = [];
  if (!Validador.validarRequerido(fase.value)) errores.push("La fase es requerida");
  if (!Validador.validarRequerido(titulo.value)) errores.push("El título es requerido");
  if (!Validador.validarRequerido(descripcion.value)) errores.push("La descripción es requerida");

  const vArchivo = Validador.validarArchivo(archivo.value, [".pdf", ".doc", ".docx", ".zip", ".rar", ".pptx", ".xlsx"], 10);
  if (!vArchivo.valido) errores.push(vArchivo.mensaje);

  if (errores.length) {
    alerta.value = errores.join(" | ");
    Utilidades.mostrarToast(alerta.value, "error");
    return;
  }

  const nueva = {
    id: generarId(),
    estudianteId: u.id,
    estudiante: u.nombre,
    fase: fase.value,
    titulo: titulo.value,
    descripcion: descripcion.value,
    archivo: archivo.value.name,
    estado: "revision",
    tutor: est.tutor,
    observaciones: "",
    fechaEntrega: obtenerFechaActual(),
    calificacion: "",
    comentarios: comentarios.value || "",
  };

  if (!Array.isArray(datos.entregas)) datos.entregas = [];
  datos.entregas.push(nueva);
  guardarDatos(datos);

  Utilidades.crearNotificacionNuevaEntrega(est.tutor, u.nombre, fase.value);

  Utilidades.mostrarToast("Entrega registrada", "success");
  limpiar();
  cargar();
}

onMounted(cargar);
</script>

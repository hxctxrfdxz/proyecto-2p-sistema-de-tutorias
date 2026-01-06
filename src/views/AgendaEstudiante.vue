<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor tutoria-solicitar">
      <div class="tarjeta">
        <h1>📅 Agenda de Tutorías</h1>
        <div id="info-tutor-asignado">
          <p>{{ infoTutor }}</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>➕ Solicitar Nueva Tutoría</h2>
          <form id="formularioSolicitarTutoria" novalidate @submit.prevent="solicitar">
            <div class="grupo-formulario">
              <label for="sol-titulo">Asunto de la tutoría *</label>
              <input
                id="sol-titulo"
                type="text"
                placeholder="Ej: Dudas sobre el capítulo 3, Revisión de propuesta, etc."
                v-model.trim="titulo"
                required
              />
              <small>Describe brevemente el motivo de la tutoría</small>
            </div>

            <div class="grupo-formulario">
              <label for="sol-fecha">Fecha preferida *</label>
              <input id="sol-fecha" type="date" v-model="fecha" required />
              <small>Selecciona una fecha futura</small>
            </div>

            <div class="grupo-formulario">
              <label for="sol-hora">Hora preferida *</label>
              <input id="sol-hora" type="time" v-model="hora" required />
              <small>Horario de atención: 08:00 - 18:00</small>
            </div>

            <div class="grupo-formulario">
              <label for="sol-descripcion">Descripción adicional</label>
              <textarea
                id="sol-descripcion"
                rows="3"
                placeholder="Describe con más detalle lo que deseas tratar en la tutoría..."
                v-model.trim="descripcion"
              ></textarea>
            </div>

            <p class="alertas" id="sol-alerta">{{ alerta }}</p>
            <button class="boton primario" type="submit">Enviar Solicitud</button>
            <button class="boton secundario" type="reset" style="margin-left:10px;" @click="limpiar">Limpiar</button>
          </form>
        </div>

        <div class="tarjeta">
          <h2>📋 Mis Solicitudes</h2>
          <div id="mis-solicitudes" class="lista-tutorias">
            <p v-if="misSolicitudes.length === 0">No tienes solicitudes.</p>

            <div v-else style="display:flex;flex-direction:column;gap:10px;">
              <div v-for="s in misSolicitudes" :key="s.id" class="tarjeta" style="padding:12px;">
                <div style="font-weight:700;">{{ s.titulo }}</div>
                <div style="color:#666;margin-top:6px;">{{ s.fecha }} {{ s.hora }} | Tutor: {{ s.tutor }}</div>
                <div style="margin-top:8px;">Estado: {{ s.estado }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📅 Tutorías Programadas (por tu tutor)</h2>
        <div id="calendario-tutorias">
          <p v-if="tutoriasProgramadas.length === 0">No hay tutorías programadas.</p>

          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div v-for="t in tutoriasProgramadas" :key="t.id" class="tarjeta" style="padding:12px;">
              <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div>
                  <div style="font-weight:700;">{{ t.titulo }}</div>
                  <div style="color:#666;margin-top:6px;">
                    {{ t.fecha }} {{ t.hora }} | Tutor: {{ t.tutor }}
                  </div>
                  <div style="color:#666;margin-top:6px;" v-if="t.modalidad || t.duracion">
                    <span v-if="t.modalidad">Modalidad: {{ t.modalidad }}</span>
                    <span v-if="t.modalidad && t.duracion"> | </span>
                    <span v-if="t.duracion">Duración: {{ t.duracion }} min</span>
                  </div>
                  <div style="margin-top:6px;">Estado: {{ t.estado }}</div>
                </div>

                <div style="display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap;">
                  <button class="boton" @click="verDetalle(t)">🔎 Ver detalle</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="detalle.visible" class="tarjeta" style="margin-top:15px;border:1px solid #eee;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
              <h3 style="margin:0;">📌 Detalle de Tutoría</h3>
              <button class="boton secundario" @click="cerrarDetalle">Cerrar</button>
            </div>

            <div style="margin-top:12px;line-height:1.7;">
              <div><strong>Asunto:</strong> {{ detalle.data.titulo }}</div>
              <div><strong>Fecha:</strong> {{ detalle.data.fecha }}</div>
              <div><strong>Hora:</strong> {{ detalle.data.hora }}</div>
              <div><strong>Tutor:</strong> {{ detalle.data.tutor }}</div>
              <div><strong>Estado:</strong> {{ detalle.data.estado }}</div>
              <div v-if="detalle.data.modalidad"><strong>Modalidad:</strong> {{ detalle.data.modalidad }}</div>
              <div v-if="detalle.data.duracion"><strong>Duración:</strong> {{ detalle.data.duracion }} min</div>
              <div v-if="detalle.data.descripcion" style="margin-top:8px;">
                <strong>Descripción:</strong> {{ detalle.data.descripcion }}
              </div>
            </div>

            <div style="margin-top:12px;color:#666;font-size:.9em;">
              *Esto simula un “enlace de detalle”. Si luego quieres, lo convertimos en una ruta real con Vue Router.
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>ℹ️ Información Importante</h2>
        <div style="padding:15px;background-color:#f8f9fa;border-radius:8px;">
          <h4>Políticas de tutorías:</h4>
          <ul style="margin-top:10px;">
            <li>Las tutorías deben solicitarse con al menos 24 horas de anticipación</li>
            <li>La duración máxima de cada tutoría es de 1 hora</li>
            <li>Puedes cancelar una tutoría con al menos 2 horas de anticipación</li>
            <li>El tutor confirmará la tutoría en un plazo máximo de 12 horas</li>
            <li>En caso de no asistir a una tutoría confirmada, se registrará como inasistencia</li>
          </ul>
          <p style="margin-top:15px;color:#666;">
            <strong>Contacto de emergencia:</strong> Si necesitas contactar a tu tutor urgentemente, envía un correo a: tutoria@uleam.edu.ec
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import BarraNavegacion from "../components/BarraNavegacion.vue";
import { manejadorAutenticacion } from "../scripts/core/autenticacion";
import { obtenerDatos, guardarSolicitudesTutoria, obtenerSolicitudesTutoria, generarId, obtenerFechaActual } from "../scripts/core/datos";
import { Utilidades } from "../scripts/utils/utilidades";
import { Validador } from "../scripts/core/validaciones";

const infoTutor = ref("Cargando información de tutor...");
const misSolicitudes = ref([]);

const titulo = ref("");
const fecha = ref("");
const hora = ref("");
const descripcion = ref("");
const alerta = ref("");

const detalle = reactive({ visible: false, data: {} });

function normalizarEstado(estado) {
  const e = String(estado || "").trim().toLowerCase();
  if (!e) return "pendiente";
  if (e === "solicitada" || e === "solicitud") return "pendiente";
  if (e === "confirmado") return "confirmada";
  if (e === "rechazado") return "rechazada";
  if (e === "cancelado") return "cancelada";
  if (e === "en_revision" || e === "en revisión") return "revision";
  return e;
}

function leerTutoriasXML() {
  const xml = localStorage.getItem("tutoriasXML") || "<tutorias></tutorias>";
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const nodos = Array.from(doc.getElementsByTagName("tutoria"));

  return nodos.map((n) => ({
    id: n.getAttribute("id") || "",
    estudiante: n.getAttribute("estudiante") || "",
    estudianteId: n.getAttribute("estudianteId") || "",
    tutor: n.getAttribute("tutor") || "",
    tutorId: n.getAttribute("tutorId") || "",
    titulo: n.getAttribute("titulo") || "",
    fecha: n.getAttribute("fecha") || "",
    hora: n.getAttribute("hora") || "",
    estado: normalizarEstado(n.getAttribute("estado") || "pendiente"),
    duracion: n.getAttribute("duracion") || "",
    modalidad: n.getAttribute("modalidad") || "",
    descripcion: n.getAttribute("descripcion") || "",
  }));
}

function escribirTutoriasXML(lista) {
  const doc = document.implementation.createDocument("", "", null);
  const root = doc.createElement("tutorias");
  doc.appendChild(root);

  lista.forEach((t) => {
    const el = doc.createElement("tutoria");
    el.setAttribute("id", String(t.id));
    el.setAttribute("estudiante", String(t.estudiante || ""));
    if (t.estudianteId !== null && t.estudianteId !== undefined) el.setAttribute("estudianteId", String(t.estudianteId));
    el.setAttribute("tutor", String(t.tutor || ""));
    if (t.tutorId !== null && t.tutorId !== undefined) el.setAttribute("tutorId", String(t.tutorId));
    el.setAttribute("titulo", String(t.titulo || ""));
    el.setAttribute("fecha", String(t.fecha || ""));
    el.setAttribute("hora", String(t.hora || ""));
    el.setAttribute("estado", normalizarEstado(t.estado));
    if (t.duracion) el.setAttribute("duracion", String(t.duracion));
    if (t.modalidad) el.setAttribute("modalidad", String(t.modalidad));
    if (t.descripcion) el.setAttribute("descripcion", String(t.descripcion));
    root.appendChild(el);
  });

  const xml = new XMLSerializer().serializeToString(doc);
  localStorage.setItem("tutoriasXML", xml);
  return xml;
}

const tutoriasProgramadas = computed(() => {
  const u = manejadorAutenticacion.obtenerUsuario();
  const lista = leerTutoriasXML();

  return lista
    .filter((t) => Number(t.estudianteId) === Number(u.id))
    .slice()
    .sort((a, b) => new Date(`${a.fecha}T${a.hora || "00:00"}`) - new Date(`${b.fecha}T${b.hora || "00:00"}`));
});

function verDetalle(t) {
  detalle.data = { ...t };
  detalle.visible = true;
}

function cerrarDetalle() {
  detalle.visible = false;
  detalle.data = {};
}

function cargar() {
  const u = manejadorAutenticacion.obtenerUsuario();
  const datos = obtenerDatos();
  const est = (datos.estudiantes || []).find((e) => e.id === u.id);

  infoTutor.value = est ? (est.tutor ? `Tu tutor asignado: ${est.tutor}` : "Aún no tienes tutor asignado") : "Cargando información de tutor...";

  const solicitudes = obtenerSolicitudesTutoria().filter((s) => Number(s.estudianteId) === u.id);
  misSolicitudes.value = solicitudes.slice().sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
}

function limpiar() {
  titulo.value = "";
  fecha.value = "";
  hora.value = "";
  descripcion.value = "";
  alerta.value = "";
}

function solicitar() {
  alerta.value = "";
  const u = manejadorAutenticacion.obtenerUsuario();
  const datos = obtenerDatos();
  const est = (datos.estudiantes || []).find((e) => e.id === u.id);

  if (!est || !est.tutor) {
    alerta.value = "No tienes tutor asignado. Solicita asignación al administrador.";
    Utilidades.mostrarToast(alerta.value, "warning");
    return;
  }

  const v = Validador.validarFormularioTutoria(titulo.value, fecha.value, hora.value);
  if (!v.valido) {
    alerta.value = v.errores.join(" | ");
    Utilidades.mostrarToast(alerta.value, "error");
    return;
  }

  const todas = obtenerSolicitudesTutoria();
  const nueva = {
    id: generarId(),
    estudianteId: u.id,
    estudiante: u.nombre,
    tutor: est.tutor,
    titulo: titulo.value,
    fecha: fecha.value,
    hora: hora.value,
    estado: "pendiente",
    fechaSolicitud: obtenerFechaActual(),
    descripcion: descripcion.value || "",
  };

  todas.push(nueva);
  guardarSolicitudesTutoria(todas);

  // ✅ CLAVE: también lo registramos en tutoriasXML para que el tutor lo vea como "pendiente"
  const listaXML = leerTutoriasXML();
  const existe = listaXML.some(
    (t) =>
      Number(t.estudianteId) === Number(u.id) &&
      String(t.tutor).trim() === String(est.tutor).trim() &&
      String(t.fecha) === String(fecha.value) &&
      String(t.hora) === String(hora.value) &&
      String(t.titulo).trim() === String(titulo.value).trim()
  );

  if (!existe) {
    listaXML.push({
      id: nueva.id,
      estudiante: u.nombre,
      estudianteId: u.id,
      tutor: est.tutor,
      tutorId: "",
      titulo: titulo.value,
      fecha: fecha.value,
      hora: hora.value,
      estado: "pendiente",
      duracion: "60",
      modalidad: "virtual",
      descripcion: descripcion.value || "",
    });
    escribirTutoriasXML(listaXML);
  }

  Utilidades.crearNotificacionSolicitudTutoria(est.tutor, u.nombre, fecha.value, hora.value);

  Utilidades.mostrarToast("Solicitud enviada", "success");
  limpiar();
  cargar();
}
onMounted(cargar);
</script>

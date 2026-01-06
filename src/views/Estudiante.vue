<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor">
      <div class="tarjeta">
        <h1 id="titulo-bienvenida">{{ titulo }}</h1>
        <div id="info-estudiante">
          <p v-if="info">{{ info }}</p>
          <p v-else>Cargando información...</p>
        </div>
      </div>

      <div class="tarjeta">
        <div class="encabezado-tarjeta">
          <h2>🔔 Notificaciones Recientes</h2>
          <button class="boton boton-pequeno secundario" id="boton-marcar-leidas" @click="marcarLeidas">
            Marcar todas como leídas
          </button>
        </div>
        <div id="notificaciones-estudiante" class="contenedor-notificaciones">
          <p v-if="notificaciones.length === 0">No hay notificaciones.</p>
          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div v-for="n in notificaciones" :key="n.id" class="tarjeta" style="padding:12px;">
              <div style="font-size:.95em;">{{ n.mensaje }}</div>
              <div style="font-size:.8em;color:#666;margin-top:6px;">{{ n.fecha }}</div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>📊 Mi Progreso</h2>
          <div id="progreso-estudiante">
            <p>{{ progreso }}</p>
          </div>
        </div>

        <div class="tarjeta">
          <h2>📋 Próximas Actividades</h2>
          <div id="proximas-actividades">
            <p v-if="proximas.length === 0">No hay próximas actividades.</p>
            <ul v-else style="margin:0;padding-left:18px;">
              <li v-for="a in proximas" :key="a.id">{{ a.texto }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📚 Tareas Activas</h2>
        <div id="tareas-activas" class="lista-tareas">
          <p v-if="tareasActivas.length === 0">No tienes tareas activas.</p>
          <div v-else style="display:flex;flex-direction:column;gap:12px;">
            <div v-for="t in tareasActivas" :key="t.id" class="tarjeta" style="padding:12px;">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:start;">
                <div>
                  <div style="font-weight:700;">{{ t.titulo }}</div>
                  <div style="color:#555;margin-top:4px;">{{ t.descripcion }}</div>
                  <div style="font-size:.9em;color:#666;margin-top:6px;">
                    Fase: {{ t.fase }} | Límite: {{ t.fechaLimite }} {{ t.hora }}
                  </div>
                </div>
                <div style="font-size:.9em;color:#333;">{{ t.estado }}</div>
              </div>
              <div style="margin-top:10px;">
                <RouterLink class="boton boton-pequeno primario" to="/subir-entregas">Subir entrega</RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📅 Próximas Tutorías</h2>
        <div id="proximas-tutorias" class="lista-tutorias">
          <p v-if="tutoriasConfirmadas.length === 0">No tienes tutorías confirmadas.</p>
          <div v-else style="display:flex;flex-direction:column;gap:10px;">
            <div v-for="s in tutoriasConfirmadas" :key="s.id" class="tarjeta" style="padding:12px;">
              <div style="font-weight:700;">{{ s.titulo }}</div>
              <div style="color:#666;margin-top:6px;">{{ s.fecha }} {{ s.hora }} | Tutor: {{ s.tutor }}</div>
              <div style="margin-top:8px;">Estado: {{ s.estado }}</div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import BarraNavegacion from "../components/BarraNavegacion.vue";
import { manejadorAutenticacion } from "../scripts/core/autenticacion";
import { Utilidades } from "../scripts/utils/utilidades";
import { obtenerDatos, guardarDatos, obtenerSolicitudesTutoria } from "../scripts/core/datos";

const titulo = ref("Bienvenido/a Estudiante");
const info = ref("");
const progreso = ref("");
const proximas = ref([]);

const notificaciones = ref([]);
const tareasActivas = ref([]);
const tutoriasConfirmadas = ref([]);

function cargar() {
  const u = manejadorAutenticacion.obtenerUsuario();
  const datos = obtenerDatos();

  const est = (datos.estudiantes || []).find((e) => e.id === u.id) || null;
  titulo.value = `Bienvenido/a ${u.nombre}`;
  info.value = est ? `Tutor: ${est.tutor || "No asignado"} | Tema: ${est.tema || "Sin tema"} | Estado: ${est.estado || "Activo"}` : "Información no disponible";

  const misTareas = (datos.tareas || []).filter((t) => t.estudianteId === u.id);
  tareasActivas.value = misTareas.filter((t) => String(t.estado || "").toLowerCase() === "activa");

  const total = misTareas.length;
  const entregadas = (datos.entregas || []).filter((e) => e.estudianteId === u.id).length;
  progreso.value = `Tareas asignadas: ${total} | Entregas registradas: ${entregadas}`;

  const solicitudes = obtenerSolicitudesTutoria().filter((s) => Number(s.estudianteId) === u.id);
  tutoriasConfirmadas.value = solicitudes.filter((s) => String(s.estado).toLowerCase() === "confirmada");

  const proximasTmp = [];
  tareasActivas.value
    .slice()
    .sort((a, b) => new Date(`${a.fechaLimite}T${a.hora}`) - new Date(`${b.fechaLimite}T${b.hora}`))
    .slice(0, 5)
    .forEach((t) => proximasTmp.push({ id: `t-${t.id}`, texto: `📝 ${t.titulo} (Límite: ${t.fechaLimite} ${t.hora})` }));

  tutoriasConfirmadas.value
    .slice()
    .sort((a, b) => new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`))
    .slice(0, 5)
    .forEach((s) => proximasTmp.push({ id: `s-${s.id}`, texto: `📅 ${s.titulo} (${s.fecha} ${s.hora})` }));

  proximas.value = proximasTmp.slice(0, 8);

  notificaciones.value = Utilidades.obtenerNotificacionesUsuario("estudiante", u.nombre)
    .slice()
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 12);
}

function marcarLeidas() {
  const u = manejadorAutenticacion.obtenerUsuario();
  const datos = obtenerDatos();
  if (!datos.notificaciones || !Array.isArray(datos.notificaciones.estudiante)) return;

  let marcadas = 0;
  datos.notificaciones.estudiante.forEach((n) => {
    if (!n.paraUsuario || n.paraUsuario === u.nombre) {
      if (!n.leida) {
        n.leida = true;
        marcadas++;
      }
    }
  });

  guardarDatos(datos);
  Utilidades.mostrarToast(`Marcadas: ${marcadas}`, "success");
  cargar();
}

onMounted(cargar);
</script>

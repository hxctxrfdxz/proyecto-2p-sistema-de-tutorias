<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor">
      <div class="tarjeta">
        <h1 id="titulo-bienvenida">Panel de Administración</h1>
        <div id="info-admin">
          <p>Sistema de Gestión de Tutorías de Titulación - ULEAM</p>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📊 Resumen del Sistema</h2>
        <div id="resumen-admin">
          <p>{{ resumen }}</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
        <div class="tarjeta">
          <h2>⚡ Acciones Rápidas</h2>
          <div id="acciones-rapidas" style="display:flex;flex-direction:column;gap:10px;margin-top:15px;">
            <RouterLink to="/registro-usuario" class="boton primario">➕ Registrar Nuevo Usuario</RouterLink>
            <RouterLink to="/asignar-tutor" class="boton primario">👥 Asignar Tutor</RouterLink>
            <RouterLink to="/registrar-tema" class="boton primario">📝 Registrar Tema</RouterLink>
            <RouterLink to="/crear-tarea" class="boton primario">📋 Crear Tarea</RouterLink>
            <button class="boton secundario" id="boton-generar-reporte" @click="generarReporte">📄 Generar Reporte</button>
            <button class="boton secundario" id="boton-exportar-datos" @click="exportarDatos">💾 Exportar Datos</button>
          </div>
        </div>

        <div class="tarjeta">
          <h2>🔔 Notificaciones del Sistema</h2>
          <div id="notificaciones-admin" class="contenedor-notificaciones">
            <p v-if="notificaciones.length === 0">No hay notificaciones.</p>

            <div v-else style="display:flex;flex-direction:column;gap:10px;">
              <div v-for="n in notificaciones" :key="n.id" class="tarjeta" style="padding:12px;">
                <div style="font-size:.95em;">{{ n.mensaje }}</div>
                <div style="font-size:.8em;color:#666;margin-top:6px;">{{ n.fecha }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>📈 Estadísticas</h2>
        <div id="estadisticas-admin">
          <div>{{ estadisticas }}</div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>👥 Usuarios Recientes</h2>
        <div id="usuarios-recientes" class="contenedor-tabla">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;">Nombre</th>
                <th style="text-align:left;padding:8px;">Correo</th>
                <th style="text-align:left;padding:8px;">Rol</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuariosRecientes" :key="u.id">
                <td style="padding:8px;">{{ u.nombre }}</td>
                <td style="padding:8px;">{{ u.correo }}</td>
                <td style="padding:8px;">{{ u.rol }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="tarjeta">
        <h2>⚙️ Configuración del Sistema</h2>
        <div id="configuracion-sistema">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
            <div>
              <h4>Límites del Sistema</h4>
              <div style="margin-top:10px;">
                <p><strong>Tamaño máximo de archivos:</strong> 10MB</p>
                <p><strong>Tutorías simultáneas por tutor:</strong> 5</p>
                <p><strong>Estudiantes por tutor:</strong> 10</p>
              </div>
            </div>

            <div>
              <h4>Información del Sistema</h4>
              <div style="margin-top:10px;">
                <p><strong>Versión:</strong> 1.0.0</p>
                <p><strong>Última actualización:</strong> <span id="ultima-actualizacion">{{ ultimaActualizacion }}</span></p>
                <p><strong>Estado:</strong> <span style="color:#4caf50;">● Activo</span></p>
              </div>
            </div>
          </div>

          <div style="margin-top:20px;padding:15px;background-color:#f8f9fa;border-radius:8px;">
            <h4>Mantenimiento</h4>
            <div style="display:flex;gap:10px;margin-top:10px;">
              <button class="boton boton-pequeno" id="boton-limpiar-cache" @click="limpiarCache">Limpiar Cache</button>
              <button class="boton boton-pequeno secundario" id="boton-respaldar" @click="respaldar">Crear Respaldo</button>
              <button class="boton boton-pequeno secundario" id="boton-reiniciar-datos" @click="reiniciar">Reiniciar Datos de Prueba</button>
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
import { obtenerDatos, guardarDatos, asegurarDatosIniciales, obtenerFechaHoraActual } from "../scripts/core/datos";
import { Utilidades } from "../scripts/utils/utilidades";
import { manejadorAutenticacion } from "../scripts/core/autenticacion";

const resumen = ref("Cargando resumen...");
const estadisticas = ref("");
const ultimaActualizacion = ref("");
const notificaciones = ref([]);
const usuariosRecientes = ref([]);

function cargar() {
  const datos = obtenerDatos();

  resumen.value = `Usuarios: ${(datos.usuarios || []).length} | Estudiantes: ${(datos.estudiantes || []).length} | Tutores: ${(datos.tutores || []).length}`;
  estadisticas.value = `Tareas: ${(datos.tareas || []).length} | Entregas: ${(datos.entregas || []).length} | Temas: ${(datos.temas || []).length}`;

  usuariosRecientes.value = (datos.usuarios || []).slice(-6).reverse();

  const u = manejadorAutenticacion.obtenerUsuario();
  notificaciones.value = Utilidades.obtenerNotificacionesUsuario("administrador", u?.nombre || "")
    .slice()
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 10);

  ultimaActualizacion.value = obtenerFechaHoraActual();
}

function exportarDatos() {
  const datos = obtenerDatos();
  const contenido = JSON.stringify(datos, null, 2);
  const blob = new Blob([contenido], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "datosUleam_export.json";
  a.click();
  URL.revokeObjectURL(url);
  Utilidades.mostrarToast("💾 Exportación lista", "success");
}

function generarReporte() {
  Utilidades.mostrarToast("📄 Reporte generado (demo)", "info");
}

function limpiarCache() {
  Utilidades.mostrarToast("Cache limpiado (no afecta datos)", "success");
}

function respaldar() {
  exportarDatos();
}

function reiniciar() {
  localStorage.removeItem("datosUleam");
  localStorage.removeItem("solicitudesTutoriaXML");
  asegurarDatosIniciales();
  Utilidades.mostrarToast("Datos reiniciados", "success");
  cargar();
}

onMounted(cargar);
</script>

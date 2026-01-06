<template>
  <header id="contenedor-barra-navegacion-superior">
    <nav class="barra-navegacion" v-if="!esLogin">
      <div class="marca-barra-navegacion">
        <img src="/images/favicon_ULEAM_2.png" alt="ULEAM" class="logo-barra-navegacion" />
      </div>

      <ul class="menu-barra-navegacion">
        <template v-for="item in items" :key="item.to">
          <li><RouterLink :to="item.to" :class="{ activo: rutaActiva(item.to) }">{{ item.label }}</RouterLink></li>
        </template>
      </ul>

      <div class="final-barra-navegacion" style="display:flex;align-items:center;gap:15px;">
        <button
          v-if="usuario"
          class="boton-notificaciones"
          @click="toggleNotificaciones"
          style="background:none;border:1px solid rgba(255,255,255,.3);color:white;padding:8px 15px;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;"
        >
          🔔 Notificaciones
          <span v-if="contador > 0" style="background:#ff4444;color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">
            {{ contador }}
          </span>
        </button>

        <div v-if="mostrarNotificaciones" style="position:absolute;right:20px;top:60px;background:white;min-width:350px;box-shadow:0 8px 16px rgba(0,0,0,.2);z-index:1000;border-radius:8px;">
          <div style="padding:15px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
            <h4 style="margin:0;">📢 Notificaciones</h4>
            <button
              @click="limpiarNotificaciones"
              style="background:#ff4444;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:5px;"
            >
              🗑️ Limpiar
            </button>
          </div>

          <div style="max-height:300px;overflow-y:auto;padding:10px;">
            <div v-if="notificaciones.length === 0" style="padding:20px;text-align:center;color:#666;">📭 No hay notificaciones</div>

            <div v-else style="display:flex;flex-direction:column;gap:8px;">
              <div
                v-for="n in notificaciones"
                :key="n.id"
                style="padding:10px;border-radius:6px;"
                :style="{
                  backgroundColor: n.leida ? '#f9f9f9' : '#e3f2fd',
                  borderLeft: n.leida ? '4px solid #ddd' : '4px solid #2196f3'
                }"
              >
                <div style="display:flex;gap:10px;align-items:start;">
                  <div style="font-size:1.2em;">📢</div>
                  <div style="flex:1;">
                    <div style="font-size:.9em;color:#333;">{{ n.mensaje }}</div>
                    <div style="font-size:.8em;color:#666;margin-top:3px;">{{ n.fecha }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style="padding:10px;border-top:1px solid #eee;text-align:center;">
            <RouterLink :to="rutaPanel" style="color:#3498db;text-decoration:none;font-size:14px;">Ver panel</RouterLink>
          </div>
        </div>

        <span v-if="usuario" style="color:white;margin-right:15px;">{{ usuario.nombre }}</span>
        <a v-if="usuario" href="#" class="boton-salir" @click.prevent="salir">Cerrar Sesión</a>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { manejadorAutenticacion } from "../scripts/core/autenticacion";
import { Utilidades } from "../scripts/utils/utilidades";
import { obtenerDatos, guardarDatos } from "../scripts/core/datos";

const route = useRoute();
const router = useRouter();

const mostrarNotificaciones = ref(false);
const notificaciones = ref([]);

const usuario = computed(() => manejadorAutenticacion.obtenerUsuario());
const esLogin = computed(() => route.path === "/index");

const rutaPanel = computed(() => {
  const rol = manejadorAutenticacion.obtenerRolUsuario();
  if (rol === "administrador") return "/admin";
  if (rol === "tutor") return "/tutor";
  return "/estudiante";
});

const items = computed(() => {
  const rol = manejadorAutenticacion.obtenerRolUsuario();
  if (rol === "estudiante") {
    return [
      { to: "/estudiante", label: "Panel" },
      { to: "/subir-entregas", label: "Subir Entregas" },
      { to: "/agenda-estudiante", label: "Solicitar Tutoría" },
    ];
  }
  if (rol === "tutor") {
    return [
      { to: "/tutor", label: "Panel" },
      { to: "/entregas-tutor", label: "Revisar Entregas" },
      { to: "/tutorias-tutor", label: "Tutorías" },
      { to: "/crear-tarea", label: "Crear Tarea" },
      { to: "/estudiantes", label: "Mis Estudiantes" },
    ];
  }
  if (rol === "administrador") {
    return [
      { to: "/admin", label: "Panel" },
      { to: "/estudiantes", label: "Estudiantes" },
      { to: "/registrar-tema", label: "Registrar Tema" },
      { to: "/asignar-tutor", label: "Asignar Tutor" },
      { to: "/crear-tarea", label: "Crear Tarea" },
      { to: "/registro-usuario", label: "Registro" },
    ];
  }
  return [];
});

const contador = computed(() => {
  const u = usuario.value;
  if (!u) return 0;
  return Utilidades.contarNotificacionesNoLeidas(u.rol, u.nombre);
});

function rutaActiva(path) {
  return route.path === path;
}

function cargarNotificaciones() {
  const u = usuario.value;
  if (!u) {
    notificaciones.value = [];
    return;
  }
  notificaciones.value = Utilidades.obtenerNotificacionesUsuario(u.rol, u.nombre)
    .slice()
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 8);
}

function toggleNotificaciones() {
  mostrarNotificaciones.value = !mostrarNotificaciones.value;
  if (mostrarNotificaciones.value) cargarNotificaciones();
}

function limpiarNotificaciones() {
  const u = usuario.value;
  if (!u) return;

  const datos = obtenerDatos();
  if (!datos.notificaciones || !Array.isArray(datos.notificaciones[u.rol])) return;

  datos.notificaciones[u.rol] = datos.notificaciones[u.rol].filter((n) => n.paraUsuario && n.paraUsuario !== u.nombre);
  guardarDatos(datos);

  cargarNotificaciones();
  Utilidades.mostrarToast("🗑️ Se eliminaron tus notificaciones", "success");
}

function salir() {
  manejadorAutenticacion.cerrarSesion();
  router.push("/index");
}

onMounted(() => {
  if (!esLogin.value) cargarNotificaciones();
});
</script>

import { createRouter, createWebHistory } from "vue-router";
import { manejadorAutenticacion } from "../scripts/core/autenticacion";

import Index from "../views/Index.vue";
import Admin from "../views/Admin.vue";
import Estudiante from "../views/Estudiante.vue";
import Tutor from "../views/Tutor.vue";

import AgendaEstudiante from "../views/AgendaEstudiante.vue";
import AsignarTutor from "../views/AsignarTutor.vue";
import CrearTarea from "../views/CrearTarea.vue";
import EntregasTutor from "../views/EntregasTutor.vue";
import Estudiantes from "../views/Estudiantes.vue";
import RegistrarTema from "../views/RegistrarTema.vue";
import RegistroUsuario from "../views/RegistroUsuario.vue";
import SubirEntregas from "../views/SubirEntregas.vue";
import TutoriasTutor from "../views/TutoriasTutor.vue";

const routes = [
  { path: "/", redirect: "/index" },

  { path: "/index", component: Index, meta: { libre: true } },

  { path: "/admin", component: Admin, meta: { rol: "administrador" } },
  { path: "/estudiante", component: Estudiante, meta: { rol: "estudiante" } },
  { path: "/tutor", component: Tutor, meta: { rol: "tutor" } },

  { path: "/agenda-estudiante", component: AgendaEstudiante, meta: { rol: "estudiante" } },
  { path: "/asignar-tutor", component: AsignarTutor, meta: { rol: "administrador" } },
  { path: "/crear-tarea", component: CrearTarea, meta: { rol: "tutor|administrador" } },
  { path: "/entregas-tutor", component: EntregasTutor, meta: { rol: "tutor" } },
  { path: "/estudiantes", component: Estudiantes, meta: { rol: "tutor|administrador" } },
  { path: "/registrar-tema", component: RegistrarTema, meta: { rol: "administrador" } },
  { path: "/registro-usuario", component: RegistroUsuario, meta: { rol: "administrador" } },
  { path: "/subir-entregas", component: SubirEntregas, meta: { rol: "estudiante" } },
  { path: "/tutorias-tutor", component: TutoriasTutor, meta: { rol: "tutor" } },

  { path: "/:pathMatch(.*)*", redirect: "/index" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (to.meta?.libre) return true;

  if (!manejadorAutenticacion.estaLogueado()) {
    return { path: "/index" };
  }

  const rol = manejadorAutenticacion.obtenerRolUsuario();
  const rolRequerido = to.meta?.rol;

  if (!rolRequerido) return true;

  if (rolRequerido.includes("|")) {
    const permitidos = rolRequerido.split("|").map((s) => s.trim());
    if (!permitidos.includes(rol)) return { path: manejadorAutenticacion.obtenerRutaRedireccion() };
    return true;
  }

  if (rol !== rolRequerido) return { path: manejadorAutenticacion.obtenerRutaRedireccion() };
  return true;
});

export default router;

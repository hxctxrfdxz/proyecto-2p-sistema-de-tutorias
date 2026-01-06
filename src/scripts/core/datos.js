import { leerXMLSolicitudes, guardarXMLSolicitudes, asegurarXMLSolicitudes } from "../utils/xml";

const CLAVE_DATOS = "datosUleam";
const CLAVE_DEMO = "datosUleamDemoInicializado";

const datosDemo = {
  usuarios: [
    { id: 1, nombre: "Ana García", correo: "estudiante@uleam.edu.ec", contraseña: "123456", rol: "estudiante" },
    { id: 2, nombre: "Carlos López", correo: "tutor@uleam.edu.ec", contraseña: "123456", rol: "tutor" },
    { id: 3, nombre: "María Rodríguez", correo: "admin@uleam.edu.ec", contraseña: "123456", rol: "administrador" },
    { id: 4, nombre: "Juan Pérez", correo: "juan@uleam.edu.ec", contraseña: "123456", rol: "estudiante" },
    { id: 5, nombre: "Laura Martínez", correo: "laura@uleam.edu.ec", contraseña: "123456", rol: "tutor" },
  ],
  estudiantes: [
    { id: 1, nombre: "Ana García", correo: "estudiante@uleam.edu.ec", tema: "Sistema de gestión académica", tutor: "Carlos López", estado: "Activo" },
    { id: 4, nombre: "Juan Pérez", correo: "juan@uleam.edu.ec", tema: "Plataforma de e-learning", tutor: "Laura Martínez", estado: "Activo" },
  ],
  tutores: [
    { id: 2, nombre: "Carlos López", correo: "tutor@uleam.edu.ec", estudiantes: [1], estado: "Disponible" },
    { id: 5, nombre: "Laura Martínez", correo: "laura@uleam.edu.ec", estudiantes: [4], estado: "Disponible" },
  ],
  tareas: [
    { id: 101, titulo: "Avance del capítulo 2", descripcion: "Realizar un resumen del capítulo 2", fase: "Desarrollo", fechaLimite: "2026-02-15", hora: "23:59", creador: "Carlos López", estudianteId: 1, fechaCreacion: "2026-01-05", estado: "Activa" },
  ],
  entregas: [],
  temas: [
    { id: 201, estudianteId: 1, estudiante: "Ana García", titulo: "Sistema de gestión académica", descripcion: "Desarrollo de un sistema para gestionar procesos académicos", fechaRegistro: "2026-01-02", estado: "Aprobado" },
  ],
  notificaciones: {
    estudiante: [],
    tutor: [],
    administrador: [],
  },
  fases: [
    { id: 1, nombre: "Propuesta", descripcion: "Presentación de propuesta", orden: 1 },
    { id: 2, nombre: "Investigación", descripcion: "Marco teórico", orden: 2 },
    { id: 3, nombre: "Desarrollo", descripcion: "Desarrollo del proyecto", orden: 3 },
    { id: 4, nombre: "Pruebas", descripcion: "Pruebas y validación", orden: 4 },
    { id: 5, nombre: "Final", descripcion: "Entrega final", orden: 5 },
  ],
};

export function asegurarDatosIniciales() {
  const existe = localStorage.getItem(CLAVE_DATOS);
  if (!existe) {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(datosDemo));
    localStorage.setItem(CLAVE_DEMO, "1");
  } else {
    const datos = obtenerDatos();
    let cambio = false;

    if (!datos.notificaciones) {
      datos.notificaciones = { estudiante: [], tutor: [], administrador: [] };
      cambio = true;
    } else {
      if (!Array.isArray(datos.notificaciones.estudiante)) { datos.notificaciones.estudiante = []; cambio = true; }
      if (!Array.isArray(datos.notificaciones.tutor)) { datos.notificaciones.tutor = []; cambio = true; }
      if (!Array.isArray(datos.notificaciones.administrador)) { datos.notificaciones.administrador = []; cambio = true; }
    }

    if (!Array.isArray(datos.estudiantes)) { datos.estudiantes = []; cambio = true; }
    if (!Array.isArray(datos.tutores)) { datos.tutores = []; cambio = true; }
    if (!Array.isArray(datos.usuarios)) { datos.usuarios = []; cambio = true; }
    if (!Array.isArray(datos.tareas)) { datos.tareas = []; cambio = true; }
    if (!Array.isArray(datos.entregas)) { datos.entregas = []; cambio = true; }
    if (!Array.isArray(datos.temas)) { datos.temas = []; cambio = true; }

    if (cambio) guardarDatos(datos);
  }

  asegurarXMLSolicitudes();
}

export function obtenerDatos() {
  return JSON.parse(localStorage.getItem(CLAVE_DATOS) || "{}");
}

export function guardarDatos(datos) {
  localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
}

export function generarId() {
  return Date.now();
}

export function obtenerFechaActual() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

export function obtenerFechaHoraActual() {
  const ahora = new Date();
  return ahora.toLocaleString("es-ES");
}

export function formatearFecha(fecha) {
  const opciones = { year: "numeric", month: "long", day: "numeric" };
  return new Date(fecha).toLocaleDateString("es-ES", opciones);
}

export function formatearHora(hora) {
  if (!hora) return "";
  return hora.substring(0, 5);
}

export function obtenerSolicitudesTutoria() {
  return leerXMLSolicitudes();
}

export function guardarSolicitudesTutoria(solicitudes) {
  guardarXMLSolicitudes(solicitudes);
}

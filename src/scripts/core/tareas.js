// src/scripts/core/tareas.js

const CLAVE_TAREAS = "uleam_tareas";

function leerJSON(clave, porDefecto) {
  try {
    const raw = localStorage.getItem(clave);
    if (!raw) return porDefecto;
    return JSON.parse(raw);
  } catch {
    return porDefecto;
  }
}

function guardarJSON(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

export function obtenerTareas() {
  return leerJSON(CLAVE_TAREAS, []);
}

export function guardarTareas(tareas) {
  guardarJSON(CLAVE_TAREAS, tareas);
}

export function crearTarea({
  tutorId,
  estudianteId,
  titulo,
  descripcion,
  fase,
  fechaLimite,
  horaLimite
}) {
  const tareas = obtenerTareas();

  const nuevaTarea = {
    id: crypto.randomUUID(),
    tutorId: String(tutorId),
    estudianteId: String(estudianteId),
    titulo: titulo.trim(),
    descripcion: descripcion.trim(),
    fase,
    fechaLimite,
    horaLimite,
    estado: "pendiente",
    creadaEn: new Date().toISOString()
  };

  tareas.unshift(nuevaTarea);
  guardarTareas(tareas);
  return nuevaTarea;
}

export function obtenerTareasPendientesPorEstudiante(estudianteId) {
  return obtenerTareas().filter(
    t =>
      String(t.estudianteId) === String(estudianteId) &&
      t.estado === "pendiente"
  );
}

export function marcarTareaEntregada(tareaId) {
  const tareas = obtenerTareas();
  const index = tareas.findIndex(t => t.id === tareaId);
  if (index === -1) return;

  tareas[index].estado = "entregada";
  guardarTareas(tareas);
}

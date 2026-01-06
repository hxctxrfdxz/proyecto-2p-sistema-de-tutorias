import { obtenerDatos, guardarDatos, generarId, obtenerFechaActual, formatearFecha, formatearHora } from "../core/datos";

export const Utilidades = {
  mostrarAlertaExito(idElemento, mensaje) {
    const el = document.getElementById(idElemento);
    if (!el) return;
    el.innerHTML = `<div class="alerta exito">✅ ${mensaje}</div>`;
    el.style.display = "block";
    setTimeout(() => (el.style.display = "none"), 5000);
  },

  mostrarAlertaError(idElemento, mensaje) {
    const el = document.getElementById(idElemento);
    if (!el) return;
    el.innerHTML = `<div class="alerta error">❌ ${mensaje}</div>`;
    el.style.display = "block";
  },

  mostrarToast(mensaje, tipo = "info") {
    let cont = document.getElementById("toast-container");
    if (!cont) {
      cont = document.createElement("div");
      cont.id = "toast-container";
      cont.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;";
      document.body.appendChild(cont);
    }

    const toast = document.createElement("div");
    const iconos = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
    const icono = iconos[tipo] || "ℹ️";
    const color =
      tipo === "success" ? "#4caf50" : tipo === "error" ? "#f44336" : tipo === "warning" ? "#ff9800" : "#2196f3";

    toast.style.cssText =
      `background:${color};color:white;padding:12px 20px;border-radius:4px;box-shadow:0 2px 5px rgba(0,0,0,.2);display:flex;align-items:center;gap:10px;`;

    toast.innerHTML = `<span style="font-size:1.2em;">${icono}</span><span>${mensaje}</span>`;
    cont.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      if (cont.children.length === 0) cont.remove();
    }, 5000);
  },

  agregarNotificacion(rol, notificacionData, usuarioEspecifico = null) {
    const datos = obtenerDatos();
    if (!datos.notificaciones) datos.notificaciones = { estudiante: [], tutor: [], administrador: [] };
    if (!Array.isArray(datos.notificaciones[rol])) datos.notificaciones[rol] = [];

    const nueva = {
      id: generarId(),
      tipo: notificacionData.tipo,
      mensaje: notificacionData.mensaje,
      fecha: obtenerFechaActual(),
      leida: false,
      paraUsuario: usuarioEspecifico,
    };

    datos.notificaciones[rol].push(nueva);
    guardarDatos(datos);
    return nueva.id;
  },

  agregarNotificacionEstudiante(nombre, data) {
    return this.agregarNotificacion("estudiante", data, nombre);
  },

  agregarNotificacionTutor(nombre, data) {
    return this.agregarNotificacion("tutor", data, nombre);
  },

  agregarNotificacionAdministrador(nombre, data) {
    return this.agregarNotificacion("administrador", data, nombre);
  },

  obtenerNotificacionesUsuario(rol, usuarioNombre) {
    const datos = obtenerDatos();
    const todas = (datos.notificaciones && datos.notificaciones[rol]) ? datos.notificaciones[rol] : [];
    return todas.filter((n) => !n.paraUsuario || n.paraUsuario === usuarioNombre);
  },

  contarNotificacionesNoLeidas(rol, usuarioNombre) {
    return this.obtenerNotificacionesUsuario(rol, usuarioNombre).filter((n) => !n.leida).length;
  },

  marcarTodasComoLeidas(rol, usuarioNombre) {
    const datos = obtenerDatos();
    if (!datos.notificaciones || !Array.isArray(datos.notificaciones[rol])) return 0;

    let marcadas = 0;
    datos.notificaciones[rol].forEach((n) => {
      if (!n.paraUsuario || n.paraUsuario === usuarioNombre) {
        if (!n.leida) {
          n.leida = true;
          marcadas++;
        }
      }
    });

    guardarDatos(datos);
    return marcadas;
  },

  crearNotificacionNuevaTarea(estudianteNombre, tituloTarea, fase, fechaLimite, hora, creador) {
    return this.agregarNotificacionEstudiante(estudianteNombre, {
      tipo: "nueva_tarea",
      mensaje: `📝 ${creador} te ha asignado una nueva tarea: "${tituloTarea}" (${fase}) - Fecha límite: ${formatearFecha(fechaLimite)} a las ${formatearHora(hora)}`,
    });
  },

  crearNotificacionNuevaEntrega(tutorNombre, estudianteNombre, fase) {
    return this.agregarNotificacionTutor(tutorNombre, {
      tipo: "nueva_entrega",
      mensaje: `📤 ${estudianteNombre} ha subido una nueva entrega para la fase "${fase}"`,
    });
  },

  crearNotificacionSolicitudTutoria(tutorNombre, estudianteNombre, fecha, hora) {
    return this.agregarNotificacionTutor(tutorNombre, {
      tipo: "solicitud_tutoria",
      mensaje: `📅 ${estudianteNombre} ha solicitado una tutoría para el ${formatearFecha(fecha)} a las ${formatearHora(hora)}`,
    });
  },
};

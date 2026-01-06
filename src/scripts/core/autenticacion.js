import { obtenerDatos } from "./datos";

class ManejadorAutenticacion {
  constructor() {
    this.usuarioActual = null;
    this.inicializar();
  }

  inicializar() {
    const sesionUsuario = sessionStorage.getItem("usuarioActual");
    if (sesionUsuario) this.usuarioActual = JSON.parse(sesionUsuario);
  }

  iniciarSesion(identificador, contraseña, rol) {
    const datos = obtenerDatos();
    const usuario = (datos.usuarios || []).find(
      (u) =>
        (u.correo === identificador || u.nombre === identificador) &&
        u.contraseña === contraseña &&
        u.rol === rol
    );

    if (usuario) {
      this.usuarioActual = usuario;
      sessionStorage.setItem("usuarioActual", JSON.stringify(usuario));
      return { exito: true, usuario };
    }

    return { exito: false, mensaje: "Credenciales incorrectas" };
  }

  cerrarSesion() {
    this.usuarioActual = null;
    sessionStorage.removeItem("usuarioActual");
  }

  estaLogueado() {
    return this.usuarioActual !== null;
  }

  obtenerUsuario() {
    return this.usuarioActual;
  }

  obtenerRolUsuario() {
    return this.usuarioActual ? this.usuarioActual.rol : null;
  }

  obtenerRutaRedireccion() {
    const rol = this.obtenerRolUsuario();
    if (rol === "estudiante") return "/estudiante";
    if (rol === "tutor") return "/tutor";
    if (rol === "administrador") return "/admin";
    return "/index";
  }
}

export const manejadorAutenticacion = new ManejadorAutenticacion();
export function obtenerUsuario() {
  try {
    const raw =
      localStorage.getItem("uleam_usuario_actual") ||
      localStorage.getItem("usuario_actual") ||
      localStorage.getItem("usuarioActual") ||
      localStorage.getItem("sesion") ||
      localStorage.getItem("session") ||
      localStorage.getItem("auth");

    if (!raw) return null;

    const data = JSON.parse(raw);

    // Normalización por si guardas dentro de { usuario: {...} }
    const u = data?.usuario ? data.usuario : data;

    if (!u) return null;

    return {
      id: u.id ?? u.usuarioId ?? u.uid ?? u.correo ?? u.email ?? u.nombre,
      nombre: u.nombre ?? u.name ?? "",
      rol: u.rol ?? u.tipo ?? "",
      correo: u.correo ?? u.email ?? ""
    };
  } catch {
    return null;
  }
}

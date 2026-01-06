export class Validador {
  static validarCorreo(correo) {
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionCorreo.test(String(correo || ""));
  }

  static validarCorreoInstitucionalUleam(correo) {
    if (!this.validarCorreo(correo)) return false;
    return String(correo).toLowerCase().endsWith("@uleam.edu.ec");
  }

  static validarRequerido(valor) {
    return valor !== null && valor !== undefined && String(valor).trim().length > 0;
  }

  static validarLongitudMinima(valor, min) {
    return this.validarRequerido(valor) && String(valor).trim().length >= min;
  }

  static validarFechaFutura(fecha) {
    const f = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return f >= hoy;
  }

  static validarHoraFutura(fecha, hora) {
    if (!this.validarFechaFutura(fecha)) return false;
    const seleccion = new Date(`${fecha}T${hora}`);
    const ahora = new Date();
    return seleccion > ahora;
  }

  static validarArchivo(archivo, tiposPermitidos, tamañoMaximoMB) {
    if (!archivo) return { valido: false, mensaje: "No se ha seleccionado ningún archivo" };

    const extension = archivo.name.split(".").pop().toLowerCase();
    const permitidas = tiposPermitidos.map((t) => t.replace(".", "").toLowerCase());

    if (!permitidas.includes(extension)) {
      return { valido: false, mensaje: `Tipo de archivo no permitido. Formatos: ${tiposPermitidos.join(", ")}` };
    }

    const maxBytes = tamañoMaximoMB * 1024 * 1024;
    if (archivo.size > maxBytes) {
      return { valido: false, mensaje: `El archivo es demasiado grande. Máximo: ${tamañoMaximoMB}MB` };
    }

    return { valido: true };
  }

  static validarFormularioLogin(identificador, contraseña, rol) {
    const errores = [];
    if (!this.validarRequerido(identificador)) errores.push("El usuario o correo es requerido");
    if (!this.validarRequerido(contraseña)) errores.push("La contraseña es requerida");
    if (!this.validarRequerido(rol)) errores.push("Debe seleccionar un rol");
    return { valido: errores.length === 0, errores };
  }

  static validarFormularioTutoria(titulo, fecha, hora) {
    const errores = [];
    if (!this.validarRequerido(titulo)) errores.push("El asunto es requerido");
    if (!this.validarRequerido(fecha)) errores.push("La fecha es requerida");
    else if (!this.validarFechaFutura(fecha)) errores.push("La fecha debe ser hoy o en el futuro");
    if (!this.validarRequerido(hora)) errores.push("La hora es requerida");
    else if (!this.validarHoraFutura(fecha, hora)) errores.push("La fecha y hora deben ser futuras");
    return { valido: errores.length === 0, errores };
  }

  static validarFormularioRegistroUsuario(nombre, correo, contraseña, confirmar, rol) {
    const errores = [];
    if (!this.validarRequerido(nombre)) errores.push("El nombre es requerido");
    if (!this.validarCorreoInstitucionalUleam(correo)) errores.push("El correo debe ser institucional (@uleam.edu.ec)");
    if (!this.validarLongitudMinima(contraseña, 6)) errores.push("La contraseña debe tener mínimo 6 caracteres");
    if (contraseña !== confirmar) errores.push("Las contraseñas no coinciden");
    if (!this.validarRequerido(rol)) errores.push("Debe seleccionar un rol");
    return { valido: errores.length === 0, errores };
  }
}

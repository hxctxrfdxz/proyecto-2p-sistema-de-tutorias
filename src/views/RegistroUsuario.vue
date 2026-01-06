<template>
  <div>
    <BarraNavegacion />

    <main class="contenedor">
      <div class="tarjeta-formulario registro-usuario">
        <h1>📝 Registro de Nuevo Usuario</h1>
        <p class="alertas" id="reg-alerta-general">Solo administradores pueden registrar nuevos usuarios</p>

        <form id="formulario-registro" novalidate @submit.prevent="registrar">
          <div class="grupo-formulario">
            <label for="reg-nombre">Nombre completo *</label>
            <input id="reg-nombre" type="text" placeholder="Ej: Ana García López" v-model.trim="nombre" required />
          </div>

          <div class="grupo-formulario">
            <label for="reg-correo">Correo institucional *</label>
            <input id="reg-correo" type="email" placeholder="usuario@uleam.edu.ec" v-model.trim="correo" required />
            <small>Debe ser un correo institucional de la ULEAM</small>
          </div>

          <div class="grupo-formulario">
            <label for="reg-contraseña">Contraseña *</label>
            <input id="reg-contraseña" type="password" minlength="6" v-model="contraseña" required />
            <small>Mínimo 6 caracteres</small>
          </div>

          <div class="grupo-formulario">
            <label for="reg-confirmar-contraseña">Confirmar contraseña *</label>
            <input id="reg-confirmar-contraseña" type="password" minlength="6" v-model="confirmar" required />
          </div>

          <div class="grupo-formulario">
            <label for="reg-rol">Rol del usuario *</label>
            <select id="reg-rol" v-model="rol" required @change="alCambiarRol">
              <option value="">-- Selecciona un rol --</option>
              <option value="estudiante">Estudiante</option>
              <option value="tutor">Tutor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <div class="grupo-formulario" id="grupo-tutor" :style="{ display: rol === 'tutor' ? 'block' : 'none' }">
            <label for="reg-especialidad">Especialidad (solo para tutores)</label>
            <input id="reg-especialidad" type="text" placeholder="Ej: Sistemas Informáticos" v-model.trim="especialidad" />
          </div>

          <div class="grupo-formulario">
            <label for="verificacion-admin">Contraseña de administrador *</label>
            <input id="verificacion-admin" type="password" placeholder="Para verificar su identidad" v-model="claveAdmin" required />
            <small>Ingrese la contraseña de administrador para autorizar el registro</small>
          </div>

          <p class="alertas" id="reg-alerta-pagina">{{ alerta }}</p>
          <button class="boton primario" type="submit">Registrar usuario</button>
          <RouterLink to="/index" class="boton secundario" style="margin-left:10px;">Cancelar</RouterLink>
        </form>

        <div style="margin-top:20px;padding:15px;background-color:#f8f9fa;border-radius:8px;">
          <h4>Información importante:</h4>
          <small>
            • Solo usuarios administradores pueden registrar nuevos usuarios<br />
            • Los correos deben ser institucionales (@uleam.edu.ec)<br />
            • Los estudiantes serán asignados a tutores posteriormente<br />
            • Los tutores pueden asignarse estudiantes desde el panel de administración
          </small>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BarraNavegacion from "../components/BarraNavegacion.vue";
import { Validador } from "../scripts/core/validaciones";
import { Utilidades } from "../scripts/utils/utilidades";
import { obtenerDatos, guardarDatos, generarId, obtenerFechaActual } from "../scripts/core/datos";

const nombre = ref("");
const correo = ref("");
const contraseña = ref("");
const confirmar = ref("");
const rol = ref("");
const especialidad = ref("");
const claveAdmin = ref("");
const alerta = ref("");

function alCambiarRol() {
  if (rol.value !== "tutor") especialidad.value = "";
}

function registrar() {
  alerta.value = "";

  const v = Validador.validarFormularioRegistroUsuario(
    nombre.value,
    correo.value,
    contraseña.value,
    confirmar.value,
    rol.value
  );
  if (!v.valido) {
    alerta.value = v.errores.join(" | ");
    Utilidades.mostrarToast(alerta.value, "warning");
    return;
  }

  const datos = obtenerDatos();
  const admin = (datos.usuarios || []).find((u) => u.rol === "administrador" && u.contraseña === claveAdmin.value);
  if (!admin) {
    alerta.value = "Contraseña de administrador incorrecta";
    Utilidades.mostrarToast(alerta.value, "error");
    return;
  }

  const existeCorreo = (datos.usuarios || []).some((u) => String(u.correo).toLowerCase() === correo.value.toLowerCase());
  if (existeCorreo) {
    alerta.value = "Ya existe un usuario con ese correo";
    Utilidades.mostrarToast(alerta.value, "error");
    return;
  }

  const nuevoId = generarId();
  const nuevoUsuario = { id: nuevoId, nombre: nombre.value, correo: correo.value, contraseña: contraseña.value, rol: rol.value };

  datos.usuarios.push(nuevoUsuario);

  if (rol.value === "estudiante") {
    datos.estudiantes.push({
      id: nuevoId,
      nombre: nombre.value,
      correo: correo.value,
      tema: "",
      tutor: "",
      estado: "Activo",
      fechaRegistro: obtenerFechaActual(),
    });
    Utilidades.agregarNotificacionEstudiante(nombre.value, {
      tipo: "registro",
      mensaje: "✅ Tu cuenta de estudiante ha sido creada. Inicia sesión para ver tus tareas y tutorías.",
    });
  }

  if (rol.value === "tutor") {
    datos.tutores.push({
      id: nuevoId,
      nombre: nombre.value,
      correo: correo.value,
      estudiantes: [],
      estado: "Disponible",
      especialidad: especialidad.value || "",
      fechaRegistro: obtenerFechaActual(),
    });
    Utilidades.agregarNotificacionTutor(nombre.value, {
      tipo: "registro",
      mensaje: "✅ Tu cuenta de tutor ha sido creada. Inicia sesión para gestionar estudiantes y tareas.",
    });
  }

  if (rol.value === "administrador") {
    Utilidades.agregarNotificacionAdministrador(nombre.value, {
      tipo: "registro",
      mensaje: "✅ Tu cuenta de administrador ha sido creada.",
    });
  }

  Utilidades.agregarNotificacionAdministrador(admin.nombre, {
    tipo: "usuario_creado",
    mensaje: `✅ Se registró un nuevo usuario: ${nombre.value} (${rol.value})`,
  });

  guardarDatos(datos);

  Utilidades.mostrarToast("Usuario registrado", "success");

  nombre.value = "";
  correo.value = "";
  contraseña.value = "";
  confirmar.value = "";
  rol.value = "";
  especialidad.value = "";
  claveAdmin.value = "";
}
</script>

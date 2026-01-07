<template>
  <div class="pagina-login">
    <BarraNavegacion />

    <main>
      <div class="tarjeta-formulario registro-login">
        <h1>Sistema de Tutorías de Titulación</h1>
        <h3>Universidad Laica Eloy Alfaro de Manabí</h3>

        <form id="formularioLogin" novalidate @submit.prevent="enviar">
          <div class="seccion-logo">
            <img src="/images/logo_uleam.png" alt="logo ULEAM" class="logo" />
          </div>

          <div class="grupo-formulario">
            <label for="login-identificador">Usuario o correo institucional</label>
            <input id="login-identificador" type="text" placeholder="usuario@uleam.edu.ec" v-model.trim="identificador" required />
          </div>

          <div class="grupo-formulario">
            <label for="login-contraseña">Contraseña</label>
            <input id="login-contraseña" type="password" placeholder="••••••••" v-model="contraseña" required />
          </div>

          <div class="grupo-formulario seleccion-rol">
            <label><input type="radio" name="rol" value="estudiante" v-model="rol" required /> Estudiante</label>
            <label><input type="radio" name="rol" value="tutor" v-model="rol" required /> Tutor</label>
            <label><input type="radio" name="rol" value="administrador" v-model="rol" required /> Administrador</label>
          </div>

          <p class="alertas" id="login-alerta">{{ alerta }}</p>
          <button class="boton primario" type="submit">Iniciar sesión</button>
        </form>
        <div style="margin-top:20px;padding:15px;background-color:#f8f9fa;border-radius:8px;">
          <h4>Credenciales de prueba:</h4>
          <small>
            <strong>Estudiante:</strong> estudiante@uleam.edu.ec / 123456<br />
            <strong>Tutor:</strong> tutor@uleam.edu.ec / 123456<br />
            <strong>Administrador:</strong> admin@uleam.edu.ec / 123456
          </small>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import BarraNavegacion from "../components/BarraNavegacion.vue";
import { manejadorAutenticacion } from "../scripts/core/autenticacion";
import { Validador } from "../scripts/core/validaciones";
import { Utilidades } from "../scripts/utils/utilidades";

const router = useRouter();

const identificador = ref("");
const contraseña = ref("");
const rol = ref("");
const alerta = ref("");

onMounted(() => {
  if (manejadorAutenticacion.estaLogueado()) {
    router.push(manejadorAutenticacion.obtenerRutaRedireccion());
  }
});

function enviar() {
  alerta.value = "";
  const v = Validador.validarFormularioLogin(identificador.value, contraseña.value, rol.value);
  if (!v.valido) {
    alerta.value = v.errores.join(" | ");
    Utilidades.mostrarToast(alerta.value, "warning");
    return;
  }

  const r = manejadorAutenticacion.iniciarSesion(identificador.value, contraseña.value, rol.value);
  if (!r.exito) {
    alerta.value = r.mensaje;
    Utilidades.mostrarToast("Credenciales incorrectas", "error");
    return;
  }

  router.push(manejadorAutenticacion.obtenerRutaRedireccion());
}
</script>

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./styles/estilos.css";
import { asegurarDatosIniciales } from "./scripts/core/datos";

asegurarDatosIniciales();

createApp(App).use(router).mount("#app");

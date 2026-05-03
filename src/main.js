import { createApp } from "vue";
import { createPinia } from "pinia";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import router from "@/router";
import App from "./App.vue";
import "./style.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Toast, {
  position: "top-right",
  transition: "Vue-Toastification__bounce",
  maxToasts: 4,
  newestOnTop: true,
  toastClassName: "boms-toast",
});

app.mount("#app");

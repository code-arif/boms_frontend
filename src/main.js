import { createApp }   from 'vue'
import { createPinia } from 'pinia'
import Toast           from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import router from '@/router'
import App    from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: 'top-right',
  transition: 'Vue-Toastification__bounce',
  maxToasts: 4,
  newestOnTop: true,
  timeout: 3500,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  toastClassName: 'boms-toast',
  containerClassName: 'boms-toast-container',
})

app.mount('#app')
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/main.css'
import '@affino/menu-vue/styles.css'
import '@affino/menu-react/styles.css'
import { initializeOverlayKernel } from './utils/overlayKernel'

import App from './App.vue'
import router from './router'

document.body.classList.add('dark')

document.documentElement.classList.add('dark')
document.body.classList.add('dark')

initializeOverlayKernel()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

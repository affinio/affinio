import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@affino/menu-vue/styles.css'
import '@affino/menu-react/styles.css'
import './assets/main.css'
import { initializeOverlayKernel } from './utils/overlayKernel'

import App from './App.vue'
import router from './router'

document.body.classList.add('dark')

document.documentElement.classList.add('dark')
document.body.classList.add('dark')
document.documentElement.dataset.affinoPreset = 'classic'
document.body.dataset.affinoPreset = 'classic'

initializeOverlayKernel()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

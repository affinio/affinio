import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/main.css'
import '@affino/menu-vue/styles.css'

import App from './App.vue'
import router from './router'

document.documentElement.classList.add('dark')
document.body.classList.add('dark')

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

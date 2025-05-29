import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

createApp(App)
  .use(router) // 👈 use the router
  .mount('#app')

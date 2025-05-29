// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/LoginPage.vue'
import StoryDisplay from '@/components/StoryDisplay.vue'

const routes = [
    { 
        path: '/',
        name: 'Stories',
        component: StoryDisplay,
        meta: { requiresAuth: true }
    },
    { path: '/login', name: 'Login', component: LoginPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token') // Check for token
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router

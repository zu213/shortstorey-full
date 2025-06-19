// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/LoginPage.vue'
import StoryDisplay from '@/components/StoryDisplay.vue'
import StoryContent from '@/components/StoryContent.vue'
import StoryRating from '@/components/StoryRating.vue'
import ProfilePage from '@/components/ProfilePage.vue'
import PublicProfilePage from '@/components/PublicProfilePage.vue'
import CreateStory from '@/components/CreateStory.vue'
import { useAuthStore } from '@/store/auth'
import CreateUser from '@/components/CreateUser.vue'

const routes = [
  { 
    path: '/',
    name: 'Stories',
    component: StoryDisplay,
  },
  {
    path: '/readstory/:id',
    name: 'Story',
    component: StoryContent,
  },
  {
    path: '/ratingstory/:id',
    name: 'StoryRating',
    component: StoryRating,
  },
  {
    path: '/scribe',
    name: 'CreateStory',
    component: CreateStory,
    meta: { loggedIn: true }
  },
  {
    path: '/profile',
    name: 'ProfilePage',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id',
    name: 'PublicProfilePage',
    component: PublicProfilePage,
  },
  {
    path: '/createAccount',
    name: 'CreateAccount',
    component: CreateUser,
    meta: { requiresAuth: false }
  },
  { path: '/loginPage', name: 'Login', component: LoginPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  console.log(!!to.meta.requiresAuth)
  const isAuthenticated = auth.isAuthenticated // Check for token
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresAuth == false && isAuthenticated) {
    next({ name: 'ProfilePage' })
  } else {
    next()
  }
})

export default router

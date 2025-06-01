<template>
    <header class="top-bar">
      <h1>My App</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/scribe">Create</router-link>
        <router-link v-if="isAuthenticated" to="/profile">Profile</router-link>
        <router-link v-if="!isAuthenticated" to="/login">Login</router-link>
        <button v-if="isAuthenticated" @click="logOut">Log out</button>
      </nav>
    </header>
  </template>

<script>
import { useAuthStore } from '@/store/auth'

export default {
    name: 'TopBar',
    data() {
        return {
            auth: null
        }
    },
    created() {
        this.auth = useAuthStore()
    },  
    computed: {
        isAuthenticated() {
            return this.auth.isAuthenticated
        }
    },
    methods: {
        logOut() {
            this.auth.logOut()
        }
    }

}
</script>
  
  <style scoped>
  .top-bar {
    background: #333;
    color: white;
    padding: 1rem;
  }
  nav a {
    margin-right: 1rem;
    color: white;
  }
  </style>
  
<template>
    <header class="top-bar">
      <img alt="Main logo" class="logo" src="../assets/logo.png">
      <h1>Short Storey</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/scribe">Create</router-link>
        <router-link v-if="isAuthenticated" to="/profile">Profile</router-link>
        <router-link v-if="!isAuthenticated" to="/loginPage">Login</router-link>
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
      this.$router.push('/')
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
  .logo {
    max-width: 200px;
    height: 20vh;
    width: 20vh;
    aspect-ratio: 1;
  }
  </style>
  
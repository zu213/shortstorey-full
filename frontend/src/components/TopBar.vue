<template>
    <header class="top-bar">
      <img alt="Main logo" class="top-bar__logo" src="../assets/logo.png">
      <h1 class="top-bar__heading">Short Storey</h1>
      <nav class="top-bar__nav">
        <router-link :class="['top-bar__link', { 'top-bar__link--selected': isSelected('/') }]" to="/">Home</router-link>
        <router-link :class="['top-bar__link', { 'top-bar__link--selected': isSelected('/scribe') }]" to="/scribe">Create</router-link>
        <router-link :class="['top-bar__link', { 'top-bar__link--selected': isSelected('/profile') }]" v-if="isAuthenticated" to="/profile">Profile</router-link>
        <router-link :class="['top-bar__link', { 'top-bar__link--selected': isSelected('/loginPage') }]" v-if="!isAuthenticated" to="/loginPage">Login</router-link>
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
    },
    isSelected(route) {
      return this.$route?.fullPath == route
    }
  }

}
</script>
  
  <style scoped lang="scss">
  .top-bar {
    background: #333;
    color: white;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__logo {
      max-width: 50px;
      aspect-ratio: 1;
      border-radius: 3px;
    }

    &__heading {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    &__nav {
      justify-content: end;
    }

    &__link {
      text-decoration: none;

      &--selected {
        color: rgb(180, 180, 180);
      }
    }

  }
  nav a {
    margin-right: 1rem;
    color: white;
  }
  </style>
  
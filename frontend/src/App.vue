<template>
  <TopBar />  
  <img alt="Vue logo" class="logo" src="./assets/logo.png">
  <router-view />
</template>

<script>
import TopBar from './components/TopBar.vue'

export default {
  name: 'App',
  components: {
    TopBar
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.logo {
  max-width: 200px;
  height: 40vh;
  width: 40vh;
  aspect-ratio: 1;
}
</style>

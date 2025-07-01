<template>
  <div class="page-not-found">
    <router-link to="/">
      How did you get here friend ?
    </router-link>
  </div>
 
  </template>

<script setup>
</script>

<script>

export default {
  name: 'PageNotFound',
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.page-not-found {
  top: 30vh;
  position: relative;
  width: 100%;
  vertical-align: middle;
  font-size: x-large;
}
</style>

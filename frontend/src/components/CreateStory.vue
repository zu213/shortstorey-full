<template>
  
  <div v-if="isAuthenticated" class="storyContainer">
    create a story here!
    <input>
    
  </div>
  <div v-else>
    you need to log in
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'

export default {
  name: 'CreateStory',
  data() {
    return {
      user: null,
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<template>
  <div class="storyContainer">
    bobo
  </div>
</template>

<script>
import { getUser } from '../bridge/bridge.js'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'ProfilePage',
  data() {
    return {
      user: null,
      auth: null
    }
  },
  computed: {
    currentUserId() {
      return localStorage.getItem('userid')
    },
    isAuthenticated() {
      return this.auth.isAuthenticated
    }
  },
  async created() {
    console.log(localStorage.getItem('userid'))
    this.auth = useAuthStore()
    this.stories = await getUser(this.currentUserId)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

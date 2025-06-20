<template>
  <div class="createUser">
    <div v-if="!isAuthenticated">
     <form @submit.prevent="submitNewUserForm">
        <label for="fname">Name:</label><br>
        <input type="text" v-model="name" name="fname" />
        <label for="fname">Password:</label><br>
        <input type="text" v-model="password" name="fpassword" />
        <input type="submit" value="Update" />
      </form> 
    </div>
    <div v-else>
    how did you get here friend ?
  </div>
  </div>
 
  </template>

<script setup>
</script>

<script>
import { createUser } from '../bridge/bridge.js'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'ProfilePage',
  data() {
    return {
      name: '',
      password: '',
      auth: null,
    }
  },
  computed: {
    isAuthenticated() {
      return this.auth?.isAuthenticated
    }
  },
  async created() {
    this.auth = useAuthStore()
  },
  methods: {
    async submitNewUserForm() {
      const userToCreate = {
        name: this.name,
        passwordHash: this.password
      }
      try {
        // TODO
        const result = await createUser(userToCreate, this.auth.token)
        console.log('Update successful:', result)
      } catch (err) {
        console.error('Update failed:', err)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

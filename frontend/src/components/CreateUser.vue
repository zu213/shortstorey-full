<template>
  <div class="create-user">
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
        await createUser(userToCreate)
        alert('User created')
        this.$router.push('/loginPage')
      } catch (err) {
        alert(err)
      }
    }
  }
}
</script>

<style scoped>
</style>

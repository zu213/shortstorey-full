<template>
  <div class="create-user">
    <div v-if="!isAuthenticated">
     <form class="create-user__form" @submit.prevent="submitNewUserForm">
      <div>
        <div class="create-user__form-username">
          <label for="fname">Username: </label>
          <input type="text" v-model="name" name="fname" />
        </div>
        <div class="create-user__form-password">
          <label for="fname">Password: </label>
          <input type="text" v-model="password" name="fpassword" />
        </div>
      </div>
      <button type="submit">Create</button>
      </form> 
    </div>
    <div class="story-display__none" v-else>
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
        this.$router.push('/signinPage')
      } catch (err) {
        alert(err)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.create-user {
  &__form {
    margin: 5px;
    &-username, &-password {
      margin: 10px;
      display: inline-block;
    }

    input {
      margin: 5px;
    }

    button {
      margin: 10px;
    }
  }
}
</style>

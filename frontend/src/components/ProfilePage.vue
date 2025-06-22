<template>
  <div class="profilePage">
    <div v-if="user?.name">
     Current name : {{ user.name }}
     <form @submit.prevent="submitUserForm">
      <div>
        <label for="fname">New name:</label>
        <input type="text" v-model="name" name="fname" />
      </div>
      <div>
        <label for="fpassword">New password:</label>
        <input type="text" v-model="password" name="fpassword" />
      </div>
      <input type="submit" value="Update" />
    </form>
    <div>
      <button @click="sendDeleteUser">
        delete account
      </button>
    </div>
    </div>
    <div>
      Your stories:
      <div v-for="(story, i) in stories" :key="i">
        <StoryCard :story="story" />
      </div>
    </div>
  </div>
</template>

<script setup>
import StoryCard from './StoryCard.vue'
</script>

<script>
import { getUser, updateUser, deleteUser } from '../bridge/bridge.js'
import { useAuthStore } from '@/store/auth'
import { getStories } from '../bridge/bridge.js'

export default {
  name: 'ProfilePage',
  data() {
    return {
      name: '',
      password: '',
      user: null,
      auth: null,
      stories: []
    }
  },
  computed: {
    currentUserId() {
      return localStorage.getItem('userId')
    },
    isAuthenticated() {
      return this.auth.isAuthenticated
    }
  },
  async created() {
    this.auth = useAuthStore()
    this.user = await getUser(this.currentUserId)
    this.stories = await getStories(`user_id=${this.user?.id}`)
  },
  methods: {
    async submitUserForm() {
      const userToUpdate = {
        id: this.user.id,
        ...(this.name && { name: this.name }),
        ...(this.password && { password: this.password }),
      }
      try {
        const result = await updateUser(userToUpdate, this.auth.token)
        console.log('Update successful:', result)
      } catch (err) {
        console.error('Update failed:', err)
      }
    },
    sendDeleteUser(){
      deleteUser(this.auth.token, this.user.id)
      this.auth.logOut()
      this.$router.push('/')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

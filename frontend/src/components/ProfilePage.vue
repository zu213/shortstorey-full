<template>
  <div class="profile-page">
    <div class="profile-page__form" v-if="user?.name">
      <h2 class="profile-page__form-title">Account details:</h2>
      <form class="profile-page__form-form" @submit.prevent="submitUserForm">
        <span class="profile-page__form-span">
          <label for="fname">Name: </label>
          <input type="text" v-model="name" name="fname" :placeholder="user.name"/>
        </span>
        <span class="profile-page__form-span">
          <label for="fpassword">Password:</label>
          <input type="text" v-model="password" name="fpassword" />
        </span>
        <div class="profile-page__form-button">
          <input type="submit" value="Submit" />
        </div>
      </form>
    <div>
      <button @click="sendDeleteUser">
        delete account
      </button>
    </div>
    </div>
    <div class="story-display">
      <h2 class="profile-page__story-title">Your stories</h2>
      <div>
        <div v-for="(story, i) in stories" :key="i">
          <StoryCard :story="story" />
        </div>
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
<style scoped lang="scss">
.profile-page {

  &__form {
    width: 60%;
    left: 20%;
    position: relative;

    &-form {
      padding: 10px;
    }

    &-span {
      padding: 1rem;
    }

    &-button {
      padding: 0.5rem;
    }
  }

  &__story-title {
    text-align: left;
    text-decoration: underline;
    padding-left: 1.5rem;
  }
}
.story-display {
  width: 60%;
  left: 20%;
}
</style>

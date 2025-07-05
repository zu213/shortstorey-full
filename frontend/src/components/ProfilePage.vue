<template>
  <div class="profile-page">
    <div class="profile-page__form" v-if="user?.name">
      <h2 class="profile-page__form-title">Account details</h2>
      <form class="profile-page__form-form" @submit.prevent="submitUserForm">
        <span class="profile-page__form-span">
          <label for="fname">Name: </label>
          <input type="text" v-model="name" name="fname" :placeholder="user.name"/>
        </span>
        <span class="profile-page__form-span">
          <label for="fpassword">Password: </label>
          <input type="text" v-model="password" name="fpassword" />
        </span>
        <div class="profile-page__form-button">
          <button class="form__submit" type="submit">Update Account</button>
        </div>
      </form>
      <div>
        <button class="dangerous" @click="sendDeleteUser">
          Delete Account
        </button>
      </div>
    </div>
    <div class="story-display" v-if="stories.length > 0">
      <h2 class="profile-page__story-title">Your stories</h2>
      <div>
        <div v-for="(story, i) in stories" :key="i">
          <StoryCard :story="story" />
        </div>
      </div>
    </div>
    <div class="story-display__none" v-if="!user && loading">
      Loading...
    </div>
    <div class="story-display__none" v-else-if="!user && !loading">
      Failed to load.
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
      stories: [],
      loading: true,
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
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        this.user = await getUser(this.currentUserId)
        this.stories = await getStories(`user_id=${this.user?.id}`)
      } catch(err) {
        alert(err)
      }
      this.loading = false
    },
    async submitUserForm() {
      const userToUpdate = {
        id: this.user.id,
        ...(this.name && { name: this.name }),
        ...(this.password && { password: this.password }),
      }
      try {
        await updateUser(userToUpdate, this.auth.token)
      } catch (err) {
        alert(err)
      } finally {
        this.loadData()
        alert("Successfully updated your account")
      }
    },
    sendDeleteUser(){
      deleteUser(this.auth.token, this.user.id).catch(err => alert(err))
      this.auth.logOut()
      this.$router.push('/')
    }
  }
}
</script>

<style scoped lang="scss">
.profile-page {

  &__form {
    width: 60%;
    left: 20%;
    position: relative;

    &-form {
      border: dotted 1px gray;
      margin: 10px;
      padding: 10px;
      border-radius: 5px;
    }

    &-span {
      padding: 1rem;

      @media screen and (max-width: 900px)  {
        padding: 0.25rem;
      }
    }

    &-button {
      margin: 0.5rem;
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

  @media screen and (max-width: 600px)  {
    width: 80%;
    left: 10%;
  }
}
</style>

<template>
  <div v-if="isAuthenticated" class="createStory">
    create a story here!
    <form @submit.prevent="submitStoryForm">
      <div>
        <label for="ftitle">Title:</label>
        <input type="text" v-model="title" name="ftitle" />
      </div>
      <div>
        <label for="fcontent">Content:</label>
        <input type="text" v-model="content" name="fcontent" />
      </div>
      <input type="submit" value="Update" />
    </form> 
  </div>
  <div v-else>
    you need to log in
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'
import { addStory } from '../bridge/bridge.js'

export default {
  name: 'CreateStory',
  data() {
    return {
      title: null,
      content: null,
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
  },
  methods: {
    async submitStoryForm() {
      const storyDetails = {
        title: this.title,
        content: this.content,
        user_id: this.auth.getUserId
      }
      try {
        const result = await addStory(storyDetails, this.auth.token)
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

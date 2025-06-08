<template>
  
  <div v-if="isAuthenticated" class="storyContainer">
    create a story here!
    <form @submit.prevent="submitStoryForm">
      <label for="ftitle">Title:</label><br>
      <input type="text" v-model="title" name="ftitle" />
      <label for="fcontent">Title:</label><br>
      <input type="text" v-model="content" name="fcontent" />
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
        console.log(storyDetails)
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

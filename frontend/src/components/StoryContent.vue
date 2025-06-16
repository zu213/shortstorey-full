<template>
  <div class="storyContainer">
    {{ story }}
    <h1>
    </h1>
    <p>
    </p>
    <div>
      <button @click="submitRating(1)">
        1
      </button>
      <button @click="submitRating(2)">
        2
      </button>
      <button @click="submitRating(3)">
        3
      </button>
      <button @click="submitRating(4)">
        4
      </button>
      <button @click="submitRating(5)">
        5
      </button>
    </div>
  </div>
</template>

<script>

import { getStory, postRating } from '../bridge/bridge.js'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'StoryContent',
  data() {
    return {
      story: null,
      auth: null
    }
  },
  async created() {
    const id = this.$route.params.id
    this.story = await getStory(id)
    this.auth = useAuthStore()
  },
  computed: {
    currentUser() {
      return localStorage.getItem('username')
    }
  },
  methods: {
    async submitRating(rating){
      console.log(this.auth.token)
      const ratingDetails = {
        actual_score: rating,
        to_story_id: this.story.id,
        user_id: this.auth.getUserId
      }
      try {
        console.log(ratingDetails)
        const result = await postRating(ratingDetails, this.auth.token)
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

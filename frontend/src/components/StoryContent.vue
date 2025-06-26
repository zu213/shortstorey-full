<template>
  <div class="story-content" v-if="story">
    <h2>Title: {{ story.title }}</h2>
    <div>user: 
      <router-link :to="`/profile/${story.user_id}`">{{ story.user.name }}</router-link>
    </div>

    <div>
      <router-link v-if="story.rating" :to="`/ratingstory/${story.id}`">
        {{story.rating * 5}}/5
      </router-link>
      <div v-else>
        No ratings yet
      </div>
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

    <div v-if="true">
      <button @click="deleteStory">
        delete story
      </button>
    </div>

    <div>
      Content: {{ story.content }}
    </div>
  </div>
</template>

<script>

import { getStory, deleteStory, postRating, putRating, checkRating } from '../bridge/bridge.js'
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
      // MAYBE MAKE ID ?
      return localStorage.getItem('username')
    }
  },
  methods: {
    async submitRating(rating){
      const ratingDetails = {
        actual_score: rating,
        to_story_id: this.story.id,
        user_id: this.auth.getUserId
      }
      const alreadyExists  = await checkRating(this.auth.getUserId, this.story.id)
      try {
        const result = alreadyExists.exists ? await putRating(ratingDetails, this.auth.token, alreadyExists.exists?.id) : await postRating(ratingDetails, this.auth.token)
        console.log('Update successful:', result)
      } catch (err) {
        alert(err)
        console.error('Update failed:', err)
      }
    },
    async deleteStory(){
      try {
        await deleteStory(this.auth.token, this.story.id)
      } catch (err) {
        alert(err)
        console.error('Update failed:', err)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.story-content {
  width: 60%;
  position: relative;
  left: 20%;
  padding-top: 5vh;
}
</style>

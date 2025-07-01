<template>
  <div class="storyRating" v-if="story">
    <div>title {{ story.title }}</div>
    <div>user: 
      <router-link :to="`/profile/${story.user_id}`">{{ story.user.name }}</router-link>
    </div>

      <div v-if="totalRating">
        total score {{story.rating * 5}}/5
      </div>
      <div v-else>
        No ratings yet
      </div>

      <div v-if="auth">
        <div v-if="userRating">
          your score {{story.rating * 5}}/5
        </div>
        <div v-else>
          you havent rated this yet
        </div>
      </div>

      <div v-for="(rating, i) in ratings" :key="i">
        {{ rating }}
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
      <button @click="deleteRating">
        delete
      </button>
    </div>
  </div>
  <div v-else>
    No story found
  </div>
</template>

<script>

import { getStory, getRatings, postRating, putRating, checkRating, deleteRating } from '../bridge/bridge.js'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'StoryRating',
  data() {
    return {
      story: null,
      auth: null,
      totalRating: null,
      userRating: null,
      ratings: []
    }
  },
  async created() {
    const id = this.$route.params.id
    this.story = await getStory(id)
    this.totalRating = this.story.rating
    this.auth = useAuthStore()
    this.userRating = (await getRatings(`to_story_id=${id}&user_id=${this.auth.getUserId}`))[0]
    this.ratings = await getRatings(`to_story_id=${id}`)
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
        alreadyExists.exists ? await putRating(ratingDetails, this.auth.token, alreadyExists.exists?.id) : await postRating(ratingDetails, this.auth.token)
      } catch (err) {
        alert(err)
      }
    },
    async deleteRating(){
      try {
        await deleteRating(this.auth.token, this.userRating.id)
      } catch (err) {
        alert(err)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

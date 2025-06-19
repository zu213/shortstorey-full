<template>
  <div class="storyContainer">
    <div>
      {{ user?.name }} stories:
      <ul>
        <li v-for="(story, i) in stories" :key="i">
          <StoryCard :story="story" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import StoryCard from './StoryCard.vue'
</script>

<script>
import { getUser } from '../bridge/bridge.js'
import { getStories } from '../bridge/bridge.js'

export default {
  name: 'PublicProfilePage',
  data() {
    return {
      name: '',
      user: null,
      stories: []
    }
  },
  computed: {
    viewedUserId() {
      return localStorage.getItem('userid')
    },
  },
  async created() {
    this.user = await getUser(this.viewedUserId)
    this.stories = await getStories(`user_id=${this.user?.id}`)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

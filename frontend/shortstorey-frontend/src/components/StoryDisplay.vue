<template>
  <div class="storyContainer">
    <ul>
      <li v-for="(story, i) in stories" :key="i">
        <StoryCard :story="story" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import StoryCard from './StoryCard.vue'
</script>

<script>
import { getStories } from '../bridge/bridge.js'

export default {
  name: 'StoryDisplay',
  data() {
    return {
      stories: []
    }
  },
  computed: {
    currentUser() {
      return localStorage.getItem('username')
    }
  },
  async created() {
    this.stories = await getStories('')
  },
  props: {
    params: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

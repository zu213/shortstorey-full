<template>
  <div class="story-display">
    <h2>Stories</h2>
    <div class="story-display--grid">
      <StoryCard v-for="(story, i) in stories" :key="i" :story="story" />
    </div>
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
      // MAYBE MAKE ID ?
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
<style scoped lang="scss">
</style>

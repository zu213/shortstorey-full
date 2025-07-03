<template>
  <div class="story-display">
    <h2>Stories</h2>
    <div v-if="stories.length > 0" class="story-display--grid">
      <StoryCard v-for="(story, i) in stories" :key="i" :story="story" />
    </div>
    <div class="story-display__none" v-else-if="loading">
      Loading...
    </div>
    <div class="story-display__none" v-else>
      No stories yet
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
      stories: [],
      loading: true,
    }
  },
  async created() {
    try {
      this.stories = await getStories('')
    } catch(err) {
      alert(err)
    }
    this.loading = false
  },
  props: {
    params: String
  }
}
</script>

<style scoped lang="scss">
</style>

<template>
  <div class="publicProfilePage">
    <div class="story-display">
      {{ user?.name }} stories:
      <div v-for="(story, i) in stories" :key="i">
        <StoryCard :story="story" />
      </div>
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
  async created() {
    const id = this.$route.params.id
    this.user = await getUser(id)
    this.stories = await getStories(`user_id=${this.user?.id}`)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

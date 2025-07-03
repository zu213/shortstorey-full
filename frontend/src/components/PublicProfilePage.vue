<template>
  <div class="publicProfilePage">
    <div class="story-display" v-if="stories.length > 0">
      <h2>{{ user?.name }}'s stories</h2>
      <div v-for="(story, i) in stories" :key="i">
        <StoryCard :story="story" />
      </div>
    </div>
    <div v-else class="story-display__none">
      No stories posted yet
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
    try{
      this.user = await getUser(id)
      this.stories = await getStories(`user_id=${this.user?.id}`)
    } catch(err) {
      alert(err)
    }
  }
}
</script>

<style scoped lang="scss">
.story-display {
  width: 60%;
  left: 20%;

  @media screen and (max-width: 600px)  {
    width: 80%;
    left: 10%;
  }
}
</style>

<template>
  <div class="storyContainer">
    <ul>
      <li v-for="(story, i) in stories" :key="i">
        {{ story }}
      </li>
    </ul>
  </div>
</template>

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
  async mounted() {
    this.stories = await getStories('')
    console.log(this.stories)
  },
  props: {
    params: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

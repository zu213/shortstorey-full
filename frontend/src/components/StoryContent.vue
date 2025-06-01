<template>
  <div class="storyContainer">
    {{ story }}
    <h1>
    </h1>
    <p>
    </p>
  </div>
</template>

<script>

import { getStory } from '../bridge/bridge.js'

export default {
  name: 'StoryContent',
  data() {
    return {
      story: null
    }
  },
  async created() {
    const id = this.$route.params.id

    this.story = await getStory(id)
  },
  computed: {
    currentUser() {
      return localStorage.getItem('username')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

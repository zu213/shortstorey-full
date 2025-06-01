<template>
  <div class="storyContainer" @click="openStory">
    <h1>{{ story.title }}</h1>
  </div>
</template>

<script>

export default {
  name: 'StoryCard',
  computed: {
    currentUser() {
      return localStorage.getItem('username')
    }
  },
  props: {
    story: Object
  },
  methods: {
    openStory(){
      this.$router.push({
        name: 'Story',
        params: { id: this.story.id },
        state: { story: this.story }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

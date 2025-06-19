<template>
  <router-link :to="`/readstory/${story.id}`">
    <div>
      <h1>{{ story.title }}</h1>
      <router-link :to="`/profile/${story.user_id}`">
        {{ story.user?.name ?? 'no author found' }}
      </router-link>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'StoryCard',
  data () {
    return {
      authorDetails: '',
    }
  },
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

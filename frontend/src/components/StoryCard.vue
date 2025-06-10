<template>
  <div class="storyContainer" @click="openStory">
    <h1>{{ story.title }}</h1>
    {{ authorDetails.name }}
  </div>
</template>

<script>
import { getUser } from '@/bridge/bridge'

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
  async created() {
    this.authorDetails = await getUser(this.story.user_id)
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

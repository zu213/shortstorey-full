<template>
  <div class="storyCard">
    <router-link :to="`/readstory/${story.id}`">
      <div>
        <h1>{{ story.title }}</h1>
        <router-link :to="`/profile/${story.user_id}`">
          {{ story.user?.name ?? 'no author found' }}
        </router-link>
      </div>
    </router-link>
  </div>
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
      // MAYBE MAKE ID ?
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

<style scoped  lang="scss">
.storyCard {
  width: 90%;
  height: 20vh;
  min-height: 50px;
  padding: 4%;
  border-radius: 10px;
  margin: 2% 2%;
  text-align: left;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}

</style>

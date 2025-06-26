<template>
  <div class="story-card">
    <router-link :to="`/readstory/${story.id}`">
      <h2 class="story-card__heading">{{ story.title }}</h2>
      <div class="story-card__content">
        {{ story.content }}
      </div>
      <div class="story-card__footer">
        <router-link :to="`/profile/${story.user_id}`">
          {{ story.user?.name ?? 'No author found' }}
        </router-link>
        -- 
        <router-link :to="`/ratingstory/${story.id}`">
          {{ story.rating ? `${story.rating * 5}/5` : 'No ratings yet'}}
        </router-link>
        -- {{ story.created_at ?? '' }}
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
.story-card {
  min-height: 50px;
  padding: 1.5em 3rem;
  border-radius: 10px;
  margin: 2% 2%;
  text-align: left;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

  &__content {
    max-height: 100px;
  }

  &__heading {
    padding: 3px 0px;
    margin: 4px 0px;
  }

  &__footer {
    padding: 3px 0px;
    padding-top: 8px;
  }
}

</style>

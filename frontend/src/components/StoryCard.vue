<template>
  <div class="story-card">
    <router-link :to="`/readstory/${story.id}`">
      <h2 class="story-card__heading">{{ story.title }}</h2>
      <div class="story-card__content">
        <span v-html="story.content" />
      </div>
      <div class="story-card__footer" @click.prevent="">
        <router-link :to="`/profile/${story.user_id}`">
          {{ story.user?.name ?? 'No author found' }}
        </router-link>
        -- 
        <router-link :to="`/readrating/${story.id}`">
          {{ story.rating ? `${story.rating * 5}/5` : 'No ratings yet'}}
        </router-link>
        {{ friendlyTime  }}
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
    friendlyTime() {
      if(!this.story?.created_at) return ''
      const date = new Date(this.story.created_at);
      const day = date.getUTCDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getUTCMonth()];

      return `-- ${day} ${month}`;
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

<style scoped lang="scss">
.story-card {
  min-height: 50px;
  padding: 1.5em 3rem;
  border-radius: 10px;
  margin: 2% 2%;
  text-align: left;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

  :hover {
    color: rgb(70, 75, 78);

    .story-card__footer{
        color: gray;
    }
  }

  a {
    text-decoration: none;
    color: gray;
    height: 100%;
    display: inline-grid;
  }

  &__content {
    max-height: 100px;
    overflow: hidden;
  }

  &__heading {
    padding: 3px 0px;
    margin: 4px 0px;
  }

  &__footer {
    position: relative;
    bottom: 0;
    padding: 3px 0px;
    padding-top: 8px;

    color: gray;

    :hover {
      color: blue;
    }

    a { 
      text-decoration: underline;
      color: darkblue;
    }
  }
}

</style>

<style lang="scss">
.story-card__content {
  span, p, ul {
    margin-top: 0;
  }
}
</style>


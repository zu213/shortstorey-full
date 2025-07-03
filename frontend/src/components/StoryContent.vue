<template>
  <div class="story-content" v-if="story">
    <div class="story-content__controls">
      <div v-if="!storyOwner" class="story-content__rating">
        <router-link class="story-content__rating-link" v-if="story.rating" :to="`/ratingstory/${story.id}`">
          {{story.rating * 5}}/5
        </router-link>
        <span v-else>
          No ratings yet
        </span>
        <span class="story-content__rating-buttons">
          <button @click="submitRating(1)">
            1
          </button>
          <button @click="submitRating(2)">
            2
          </button>
          <button @click="submitRating(3)">
            3
          </button>
          <button @click="submitRating(4)">
            4
          </button>
          <button @click="submitRating(5)">
            5
          </button>
        </span>
      </div>
      <div v-else>
        <button class="dangerous story-content__delete" @click="deleteStory">
          Delete Story
        </button>
      </div>
    </div>

    <div class="story-content-container">
      <h2 class="story-content__title">Title: {{ story.title }}</h2>
      <div class="story-content__author">
        Author: 
        <router-link :to="`/profile/${story.user_id}`">{{ story.user.name }}</router-link>
      </div>
    </div>
    <div class="story-content__content">
      <span v-html="story.content" />
    </div>
  </div>
  <div class="story-display__none" v-else-if="failedToLoad">
    Failed to load :(
  </div>
  <div class="story-display__none" v-else>
    Loading...
  </div>
</template>
<script>

import { getStory, deleteStory, postRating, putRating, checkRating } from '../bridge/bridge.js'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'StoryContent',
  data() {
    return {
      story: null,
      auth: null,
      storyOwner: false,
      failedToLoad: false
    }
  },
  async created() {
    this.loadData()
  },
  methods: {
    async loadData(){
      const id = this.$route.params.id
      try {
        this.story = await getStory(id)
        this.auth = useAuthStore()
      } catch(err){
        this.failedToLoad = true
        alert(err)
      }
      this.storyOwner = this.story.user_id == this.auth.getUserId
    },
    async submitRating(rating){
      const ratingDetails = {
        actual_score: rating,
        to_story_id: this.story.id,
        user_id: this.auth.getUserId
      }
      try {
        const alreadyExists  = await checkRating(this.auth.getUserId, this.story.id)
        alreadyExists.exists ? await putRating(ratingDetails, this.auth.token, alreadyExists.exists?.id) : await postRating(ratingDetails, this.auth.token)
      } catch (err) {
        alert(err)
      } finally {
        this.loadData()
      }
    },
    deleteStory(){
      deleteStory(this.auth.token, this.story.id).then(() => {
        this.$router.go(-1)
      }).catch((err) => {
        alert(err)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.story-content {
  padding-top: 5vh;
  position: relative;

  &-container {
    position: relative;
    width: 60%;
    left: 20%;
  }

  &__title, &__author {
    margin: 5px;
  }

  &__content {
    margin: 15px 5px;
    text-align: left;
    position: relative;
    left: 10%;
    width: 80%;
  }

  &__controls {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.25rem;

    
    @media screen and (max-width: 800px)  {
      position: relative;
    }
  }

  &__rating {
    &-link {
      padding: 1rem;
    }

    &-buttons {
      padding: 1rem;
      
      button {
        margin: 3px;
      }
    }
  }

  &__delete {
    margin: 10px;
  }
}
</style>

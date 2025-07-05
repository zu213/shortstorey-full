<template>
  <div class="story-rating" v-if="story">
    <h3>Story Title: {{ story.title }}</h3>
    <div class="story-rating__author">Author: 
      <router-link :to="`/profile/${story.user_id}`">{{ story.user.name }}</router-link>
    </div>

    <div class="story-rating__info" v-if="totalRating">
      Total score: {{(story.rating * 5).toFixed(2)}}/5
    </div>
    <div class="story-rating__info" v-else>
      No ratings yet
    </div>

    <div class="story-rating__info" v-if="auth">
      <div v-if="userRating">
        Your score: {{userRating.actual_score}}/5
      </div>
      <div v-else>
        You havent rated this yet
      </div>
    </div>

    <div  class="story-rating__buttons">
      <button :class="{'selected' : userRating?.actual_score == 1}" @click="submitRating(1)">
        1
      </button>
      <button :class="{'selected' : userRating?.actual_score == 2}" @click="submitRating(2)">
        2
      </button>
      <button :class="{'selected' : userRating?.actual_score == 3}" @click="submitRating(3)">
        3
      </button>
      <button :class="{'selected' : userRating?.actual_score == 4}" @click="submitRating(4)">
        4
      </button>
      <button :class="{'selected' : userRating?.actual_score == 5}" @click="submitRating(5)">
        5
      </button>
      <button class="dangerous" @click="deleteRating">
        Delete Rating
      </button>
    </div>

     <div v-if="ratings.length > 0" class="story-rating__container">
      <h3>All ratings</h3>
      <div class="story-rating__rating" v-for="(rating, i) in ratings" :key="i">
        <span class="story-rating__rating-name">
          User: {{ rating.user?.name ?? 'No name' }}
        </span>
        <span>
          Given rating: {{ rating.actual_score }}
        </span>
      </div>
    </div>
  </div>
  <div v-else>
    No story found
  </div>
</template>

<script>

import { getStory, getRatings, postRating, putRating, checkRating, deleteRating } from '../bridge/bridge.js'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'StoryRating',
  data() {
    return {
      story: null,
      auth: null,
      totalRating: null,
      userRating: null,
      ratings: []
    }
  },
  async created() {
    this.auth = useAuthStore()
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const id = this.$route.params.id
        this.story = await getStory(id)
        this.totalRating = this.story.rating
        this.userRating = (await getRatings(`to_story_id=${id}&user_id=${this.auth.getUserId}`))[0]
        this.ratings = await getRatings(`to_story_id=${id}`)
      
      } catch(err) {
        alert(err)
      }
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
    deleteRating(){
      deleteRating(this.auth.token, this.userRating.id).then(() => {
        if(this.ratings.length < 2) {
          this.$router.go(-1);
        } else {
          this.loadData()
        }
      }).catch((err) => {
        alert(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.selected {
  color: green;
  background-color: rgb(236, 236, 236);
  transform: scale(0.99);
}

.story-rating {

  &__info, &__author {
    padding: 5px;
    font-size: large;
  }

  &__container {
    margin: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: gray;
    border-radius: 5px;
    width: fit-content;
    position: relative;
    left: 50%;
    transform: translate(-50%, 0);
  }

  &__rating {
    padding: 10px 20px;

    &-name {
      max-width: 50vw;
    }
  }

  &__buttons {
    margin: 10px;
    button {
      margin: 4px;
    }
  }
}
</style>

<template>
  <div v-if="isAuthenticated" class="create-story">
    <h2 class="create-story__subtitle">
      Create a story here!
    </h2>
    <form class="create-story__form" @submit.prevent="submitStoryForm">
      <div class="form__title">
        <label for="ftitle">Title:</label>
        <input type="text" v-model="title" name="ftitle" />
      </div>
      <div class="form__content">
        <label for="fcontent">Content:</label>
        <input type="text" v-model="content" name="fcontent" />
      </div>
      <input class="form__submit" type="submit" value="Update" />
    </form> 
  </div>
  <div v-else>
    you need to log in
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'
import { addStory } from '../bridge/bridge.js'

export default {
  name: 'CreateStory',
  data() {
    return {
      title: null,
      content: null,
      auth: null
    }
  },
  created() {
    this.auth = useAuthStore()
  },  
  computed: {
    isAuthenticated() {
      return this.auth.isAuthenticated
    }
  },
  methods: {
    async submitStoryForm() {
      const storyDetails = {
        title: this.title,
        content: this.content,
        user_id: this.auth.getUserId
      }
      try {
        const result = await addStory(storyDetails, this.auth.token)
        console.log('Update successful:', result)
      } catch (err) {
        console.error('Update failed:', err)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.create-story {
  width: 80%;
  text-align: left;
  left: 10%;
  height: 150vh;
  position: relative;

  &__subtitle {
    text-align: center;
    width: calc(100% - 10px);
    padding: 10px;
  }

  &__form{
    box-sizing: border-box;
    height: 100%;
  }
}

.form {

  &__title, &__content {
    width: 100%;

    label {
      display: block;
      width: 100%;
      text-align: center;
    }

    input {
      flex: 1;
      padding: 2px;
      box-sizing: border-box;
    }
  }

  &__title input {
    width: 50%;
    position: relative;
    left: 50%;
    transform: translate(-50%, 0%);
  }
}

</style>

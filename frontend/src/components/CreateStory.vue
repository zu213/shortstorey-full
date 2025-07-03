<template>
  <div v-if="isAuthenticated" class="create-story">
    <h2 class="create-story__subtitle">
      Create a story here!
    </h2>
    <form class="form" @submit.prevent="submitStoryForm">
      <div class="form__title">
        <label for="ftitle">Title:</label>
        <input type="text" v-model="title" name="ftitle" />
      </div>
      <div class="form__content">
        <label for="fcontent">Content:</label>
        <QuillEditor style="height: 250px" v-model:content="content" contentType="html" :toolbar="toolbarOptions" theme="snow" />
      </div>
      <div>
        <input class="form__submit" type="submit" value="Post Story" />
      </div>
    </form>
  </div>
  <div v-else>
    you need to log in
  </div>
</template>

<script setup>
</script>

<script>
import { QuillEditor } from '@vueup/vue-quill'
import { useAuthStore } from '@/store/auth'
import { addStory } from '../bridge/bridge.js'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
  name: 'CreateStory',
  components: {
    QuillEditor
  },
  data() {
    return {
      title: null,
      content: '',
      auth: null,
      toolbarOptions: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ]
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
        await addStory(storyDetails, this.auth.token)
        alert('Story successfully posted')
        this.$router.push('/')
      } catch (err) {
        alert(err)
      }
    }
  }
}
</script>

<style scoped lang="scss">

.create-story {
  width: 80%;
  text-align: left;
  left: 10%;
  position: relative;

  &__subtitle {
    text-align: center;
    width: calc(100% - 10px);
  }
}

.form {
  box-sizing: border-box;
  height: 100%;

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
    text-align: center;
    left: 50%;
    transform: translate(-50%, 0%);
  }

  &__content input {
    width: 100%;
  }

  &__submit {
    text-align: center;
    left: 50%;
    margin-top: 1em;
    position: relative;
    transform: translate(-50%, 0);

    &:active {
      transform: scale(0.98) translate(-50%, 0);
    }
  }
}

</style>

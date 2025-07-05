<template>
    <div class="login-page">
        <h2>Login</h2>
        <form class="login-page__form" @submit.prevent="login">
        <div>
          <div class="login-page__form-username">
            <label>Username: </label>
            <input v-model="username" placeholder="Username" required />
          </div>
          <div class="login-page__form-password">
            <label>Password: </label>
            <input v-model="password" type="password" placeholder="Password" required />
          </div>
        </div>
        <button type="submit">Login</button>
        </form>
        <div class="login-page__footnote">
          New here ? <router-link to="/createAccount">Create an Account</router-link>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'
import { attemptLogin } from '../bridge/bridge.js'

export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
      auth: null,
    }
  },
  created() {
    this.auth = useAuthStore()
  },
  methods: {
    async login() {
      const userSideCheck = 1
      if (1 === userSideCheck) {
        try {
          const loginResponse = await attemptLogin(this.username, this.password)
          if(loginResponse.token){
            this.auth.logIn(loginResponse)
            this.$router.push({ name: 'Stories' })
          }else if(loginResponse.validUser == true){
            alert('Invalid username')
          }else{
            alert('Invalid password')
          }
        } catch(err){
          alert(err)
        }
      } else {
        alert('Invalid credentials')
      }
    }
  }
}
</script>

<style lang="scss">
.login-page {
  &__form {

    &-username, &-password {
      margin: 5px;
      display: inline-block;
    }

    input {
      margin: 5px;
    }

    button {
      margin: 10px;
    }
  }

  &__footnote {
    margin: 10px;
    font-size: large;
  }
}
</style>

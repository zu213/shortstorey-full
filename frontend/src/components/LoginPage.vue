<template>
    <div class="login">
        <h2>Login</h2>
        <form @submit.prevent="login">
        <input v-model="username" placeholder="Username" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
        </form>
        <div>
          New here ? <router-link to="/createAccount">create ana ccount</router-link>
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
        const loginResponse = await attemptLogin(this.username, this.password)
        if(loginResponse.token){
          this.auth.logIn(loginResponse)
          this.$router.push({ name: 'Stories' })
        }else if(loginResponse.validUser == true){
          alert('Invalid credentials')
        }else{
          alert('Invalid credentials')
        }
      } else {
        alert('Invalid credentials')
      }
    }
  }
}
</script>

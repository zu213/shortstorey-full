<template>
    <div class="login">
        <h2>Login</h2>
        <form @submit.prevent="login">
        <input v-model="username" placeholder="Username" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
        </form>
    </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'

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
    login() {
      // Mock login logic
      if (this.username === 'admin' && this.password === 'password') {
        this.auth.logIn('mock')
        this.$router.push({ name: 'Stories' })
      } else {
        alert('Invalid credentials')
      }
    }
  }
}
</script>

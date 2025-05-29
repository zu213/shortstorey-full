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
    export default {
        name: 'LoginPage',
        data() {
            return {
            username: '',
            password: ''
            }
        },
        methods: {
            login() {
            // Mock login logic
            if (this.username === 'admin' && this.password === 'password') {
                localStorage.setItem('token', 'mock-token')
                localStorage.setItem('username', this.username)
                this.$router.push({ name: 'Stories' })
            } else {
                alert('Invalid credentials')
            }
            }
        }
    }
</script>

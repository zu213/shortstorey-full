import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId')
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUserId: (state) => state.userId
  },
  actions: {
    logIn({token, username, userId}) {
      this.token = token
      this.userId = userId
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      localStorage.setItem('userId', userId)
    },
    logOut() {
      this.token = null
      this.userId = null
      this.username = null
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('userId')
    }
  }
})
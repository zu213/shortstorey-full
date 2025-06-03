import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token')
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    logIn(token, username, userId) {
      this.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      localStorage.setItem('userid', userId)
    },
    logOut() {
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
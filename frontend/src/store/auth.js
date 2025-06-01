import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token')
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    logIn(token) {
      this.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('username', this.username)
      localStorage.setItem('userid', 'e4d839da-1c18-4a28-ac1d-546dc0e6b7b6')
      localStorage.removeItem('token')
    },
    logOut() {
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/stories': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/user': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/login': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/rating': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
      // add other API routes here
    }
  }
})

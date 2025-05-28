const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/story': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/user': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
      // add other API routes here
    }
  }
})

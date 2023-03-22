import { resolve } from 'path'
import { defineConfig } from 'vite'

// Plugins
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Icons from 'vite-plugin-icons'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },

  plugins: [
    Vue(),
    Icons(),
    Pages({
      pagesDir: 'src/pages',
      extensions: ['vue'],
    }),
    WindiCSS(),
  ],
})

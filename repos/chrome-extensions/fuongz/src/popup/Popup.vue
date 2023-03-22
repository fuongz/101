<script setup lang="ts">
import { storageConfig } from '~/logic/storage'

const url = ref('')

const download = async () => {
  window.open(`https://fugon11-youtube-downloader.herokuapp.com/watch?v=${url.value}`)
}

console.log(storageConfig.value)
</script>

<template>
  <main class="w-[300px] px-4 py-3 text-gray-700">
    <div>
      <input v-model="url" type="text" placeholder="v?=" class="focus:outline-none border-gray-300 rounded px-3 py-1.5 border-1 mr-2" />
      <button class="bg-violet-900 text-white rounded px-3 py-1.5" @click="download()">Download</button>
    </div>
  </main>
</template>

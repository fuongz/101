<template>
  <div v-if="isVoz">
    <div class="fixed bottom-4 right-4">
      <div class="flex gap-4">
        <a href="https://voz.vn/f/diem-bao.33/" class="p-4 shadow-sm bg-purple-700 w-8 h-8 rounded-full flex justify-center items-center text-white no-underline hover:bg-purple-600">
          <span>F33</span>
        </a>

        <a class="p-4 shadow-sm cursor-pointer bg-purple-700 w-8 h-8 rounded-full flex justify-center items-center text-white no-underline hover:bg-purple-600" @click="refresh()">
          <span><mdi-reload /></span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isVoz = ref<boolean>(false)

const refresh = () => {
  window.location.reload()
}

onBeforeMount(() => {
  if (window.location.hostname === 'voz.vn') isVoz.value = true
})
</script>

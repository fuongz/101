<template>
  <div class="max-w-4xl mx-auto px-4 xl:px-0 py-4 font-mono">
    <h1 class="text-5xl">Redirecting...</h1>
  </div>
</template>

<script lang="ts" setup>
  import { onBeforeMount } from '@vue/runtime-core'
  import { useRouter } from 'vue-router'

  onBeforeMount(() => useRouter().push('/futures-target'))
</script>

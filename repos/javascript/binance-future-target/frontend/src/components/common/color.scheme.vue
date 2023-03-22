<template>
  <span
    class="
      p-1
      flex
      items-center
      rounded
      text-gray-400
      cursor-pointer
      transition
      dark:bg-gray-700
      hover:transition hover:text-gray-600 hover:bg-gray-100
      dark:hover:text-gray-200 dark:hover:bg-gray-600
    "
    @click="toggleColorScheme"
  >
    <icon-moon v-if="isDark" class="fill-current w-6 h-6" />
    <icon-sun v-else class="fill-current w-6 h-6" />
  </span>
</template>

<script lang="ts" setup>
  import { useDark, useToggle } from '@vueuse/core'
  import IconSun from 'virtual:vite-icons/ph/sun-duotone'
  import IconMoon from 'virtual:vite-icons/ph/moon-duotone'

  const isDark = useDark()
  const toggleColorScheme = useToggle(isDark)
</script>

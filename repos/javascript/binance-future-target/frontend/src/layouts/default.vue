<template>
  <div>
    <div
      class="
        flex
        px-4
        w-full
        items-center
        h-12
        fixed
        top-0
        border-b
        dark:(border-dark-500
        bg-dark-800)
      "
    >
      <router-link to="/">
        <icon-logo class="text-3xl" />
      </router-link>
      <div class="flex space-x-4 items-center ml-14">
        <router-link
          to="/futures-target"
          class="
            flex
            items-center
            space-x-2
            text-gray-600
            px-4
            py-1
            rounded
            tracking-tight
            transition
            hover:(text-gray-900
            transition
            bg-gray-200
            )
            dark:(text-gray-400) dark:hover:(text-gray-200
            bg-gray-800)
          "
        >
          <span>Futures Target</span>
        </router-link>

        <router-link
          to="/profit-calculator"
          class="
            flex
            items-center
            space-x-2
            text-gray-600
            px-4
            py-1
            rounded
            tracking-tight
            transition
            hover:(text-gray-900
            transition
            bg-gray-200)
            dark:(text-gray-400) dark:hover:(text-gray-200
            bg-gray-800)
          "
        >
          <span>Profit Calculator</span>
        </router-link>
      </div>
      <color-scheme class="ml-auto" />
    </div>
  </div>
  <div class="pt-16">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
  import IconLogo from 'virtual:vite-icons/openmoji/coin'
  import ColorScheme from '~/components/common/color.scheme.vue'
</script>

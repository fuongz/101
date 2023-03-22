<template>
  <div :class="props.class">
    <div v-if="props.busy === true">
      <p>Loading...</p>
    </div>
    <slot v-else />
  </div>
</template>

<script lang="ts" setup>
  import { defineProps } from '@vue/runtime-core'
  const props = defineProps(['busy', 'class'])
</script>

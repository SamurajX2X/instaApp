<template>
  <div class="flex flex-col items-center justify-center p-8">
    <div 
      :class="[
        'border-4 border-primary/30 border-t-primary rounded-full animate-spin',
        size === 'small' ? 'w-6 h-6' : size === 'large' ? 'w-16 h-16' : 'w-12 h-12'
      ]"
    ></div>
    <p v-if="showText" class="mt-4 text-gray-600 text-sm">Loading...</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  showText: true
})
</script>

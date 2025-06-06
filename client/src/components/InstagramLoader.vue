<template>
  <div class="inline-flex items-center justify-center" :class="containerClass">
    <div class="instagram-heart-loader" :class="heartClass">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </div>
    <span v-if="showText" class="ml-2 text-sm text-gray-600">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  text?: string
  variant?: 'default' | 'instagram'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showText: false,
  text: 'Loading...',
  variant: 'default'
})

const containerClass = computed(() => {
  switch (props.size) {
    case 'small': return 'text-sm'
    case 'large': return 'text-lg'
    default: return 'text-base'
  }
})

const heartClass = computed(() => {
  const sizeClass = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  }[props.size]

  const colorClass = props.variant === 'instagram' 
    ? 'text-instagram-pink' 
    : 'text-primary'

  return `${sizeClass} ${colorClass} animate-pulse`
})
</script>

<style scoped>
.instagram-heart-loader {
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}
</style>

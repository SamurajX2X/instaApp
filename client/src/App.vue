<template>
  <div id="app" class="min-h-screen bg-main font-sans">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  try {
    // Check if user is already authenticated
    await authStore.checkAuth()
  } catch (error) {
    console.error('Auth check failed:', error)
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import './styles/main.css';
</style>

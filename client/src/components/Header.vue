<template>
  <UploadModal v-model:show="showUploadModal" />
  
  <header class="glass-effect shadow-navbar sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-5 h-[70px] flex justify-between items-center">      <div class="text-2xl font-bold">
        <router-link to="/" class="instagram-gradient-text hover:opacity-80 transition-opacity text-shadow">
          InstaApp
        </router-link>
      </div>

      <div class="hidden md:block relative">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search"
            aria-label="Search"
            class="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-instagram-pink/20 transition-all hover:bg-gray-50"
          />
        </div>
      </div>

      <nav class="flex gap-4 md:gap-6 items-center">
        <router-link 
          to="/" 
          class="p-2 text-dark hover:text-primary hover:bg-light rounded-lg transition-all duration-200 relative"
          title="Home" 
          aria-label="Home"
        >
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </router-link>        <button class="p-2 text-dark hover:text-primary hover:bg-light rounded-lg transition-all duration-200" title="Messages" aria-label="Messages">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
          <button
          class="p-2 text-dark hover:text-primary hover:bg-light rounded-lg transition-all duration-200"
          title="Create"
          aria-label="Create"
          @click="showUploadModal = true"
        >
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
          <button class="p-2 text-dark hover:text-primary hover:bg-light rounded-lg transition-all duration-200" title="Explore" aria-label="Explore">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        <div class="relative">
          <button
            class="p-2 text-dark hover:text-primary hover:bg-light rounded-lg transition-all duration-200 relative"
            @click="showNotifications = !showNotifications"
            title="Activity"
            aria-label="Activity"
          >
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span class="notification-dot"></span>
          </button>

          <div v-if="showNotifications" class="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div class="p-4 border-b border-gray-200">
              <h3 class="font-semibold text-gray-900">Activity</h3>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <div class="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <p class="text-sm text-gray-900 mb-1">
                  <span class="font-semibold">jane_smith</span> liked your post
                </p>
                <p class="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div class="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <p class="text-sm text-gray-900 mb-1">
                  <span class="font-semibold">travel_lover</span> started following you
                </p>
                <p class="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoggedIn" class="flex items-center gap-4">
          <router-link to="/profile" class="block">
            <img
              :src="user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'"
              alt="Profile"
              class="w-8 h-8 rounded-full object-cover border-2 border-gray-200 hover:border-primary transition-colors"
            />
          </router-link>
          <button 
            @click="handleLogout" 
            class="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" 
            title="Logout"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
        
        <div v-else class="flex gap-4">
          <router-link 
            to="/login" 
            class="bg-primary hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            Login
          </router-link>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import UploadModal from './UploadModal.vue'

const authStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(authStore)

const searchQuery = ref('')
const showNotifications = ref(false)
const showUploadModal = ref(false)

const handleLogout = () => {
  authStore.logout()
}

// Close notifications when clicking outside
const closeNotifications = () => {
  showNotifications.value = false
}

// Add click outside listener
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', closeNotifications)
})

onUnmounted(() => {
  document.removeEventListener('click', closeNotifications)
})
</script>

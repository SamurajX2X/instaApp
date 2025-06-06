<template>  <div class="min-h-screen bg-gradient-to-br from-main via-white to-gray-50">
    <Header />
    
    <main class="max-w-2xl mx-auto px-4 py-8">
      <!-- Stories Section -->
      <div class="mb-8 overflow-hidden">
        <div class="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
          <!-- Your Story -->
          <div class="flex flex-col items-center flex-shrink-0">
            <div class="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 cursor-pointer hover:border-instagram-pink transition-colors">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span class="text-xs text-gray-600">Your story</span>
          </div>
          
          <!-- Friend Stories -->
          <div v-for="story in stories" :key="story.id" class="flex flex-col items-center flex-shrink-0">
            <div class="p-[2px] rounded-full bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink mb-2 cursor-pointer">
              <div class="w-16 h-16 rounded-full border-2 border-white overflow-hidden">
                <img :src="story.avatar" :alt="story.username" class="w-full h-full object-cover" />
              </div>
            </div>
            <span class="text-xs text-gray-600">{{ story.username }}</span>
          </div>
        </div>
      </div>      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center min-h-[200px] space-y-4">
        <InstagramLoader size="large" variant="instagram" show-text text="Loading your feed..." />
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center p-8">
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {{ error }}
        </div>        <button 
          @click="fetchPosts" 
          class="bg-gradient-to-r from-instagram-purple via-instagram-pink to-instagram-orange text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-instagram-pink/25 hover:-translate-y-0.5"
        >
          Try Again
        </button>
      </div>
      
      <!-- Posts Feed -->
      <div v-else-if="posts.length > 0" class="flex flex-col gap-8">
        <PostCard 
          v-for="post in posts" 
          :key="post.id" 
          :post="post" 
        />
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-16 px-8">
        <svg class="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
        <p class="text-gray-600 mb-6">Start by uploading your first photo!</p>        <button 
          @click="openUploadModal" 
          class="bg-gradient-to-r from-instagram-purple via-instagram-pink to-instagram-orange text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-instagram-pink/25 hover:-translate-y-0.5"
        >
          Upload Photo
        </button>
      </div>    </main>
      <!-- Floating Action Button for Mobile -->
    <button 
      @click="openUploadModal"
      class="fixed bottom-20 right-6 md:hidden w-14 h-14 bg-gradient-to-r from-instagram-purple via-instagram-pink to-instagram-orange text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
    
    <!-- Scroll to Top Button -->
    <button 
      v-if="showScrollTop"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 w-12 h-12 bg-white border border-gray-200 text-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Header from '../components/Header.vue'
import PostCard from '../components/PostCard.vue'
import AppLoader from '../components/AppLoader.vue'
import InstagramLoader from '../components/InstagramLoader.vue'
import { usePostsStore } from '../stores/posts'

const postsStore = usePostsStore()
const { posts, loading, error } = storeToRefs(postsStore)

// Scroll to top functionality
const showScrollTop = ref(false)

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Mock stories data
const stories = ref([
  { id: 1, username: 'sarah_j', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face' },
  { id: 2, username: 'mike_chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face' },
  { id: 3, username: 'travel_girl', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face' },
  { id: 4, username: 'foodie_max', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face' },
  { id: 5, username: 'nature_lover', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face' },
])

const fetchPosts = async () => {
  await postsStore.fetchPosts()
}

const openUploadModal = () => {
  // This will be handled by the Header component
  // We could emit an event or use a global state
  console.log('Open upload modal')
}

onMounted(() => {
  fetchPosts()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="main-layout">
    <Header />
    
    <main class="main-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <AppLoader />
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-message">{{ error }}</div>
        <button @click="fetchPosts" class="btn btn-primary">
          Try Again
        </button>
      </div>
      
      <!-- Posts Feed -->
      <div v-else-if="posts.length > 0" class="posts-feed">
        <PostCard 
          v-for="post in posts" 
          :key="post.id" 
          :post="post" 
        />
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <h3 class="empty-title">No posts yet</h3>
        <p class="empty-subtitle">Start by uploading your first photo!</p>
        <button @click="openUploadModal" class="btn btn-primary">
          Upload Photo
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Header from '../components/Header.vue'
import PostCard from '../components/PostCard.vue'
import AppLoader from '../components/AppLoader.vue'
import { usePostsStore } from '../stores/posts'

const postsStore = usePostsStore()
const { posts, loading, error } = storeToRefs(postsStore)

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
})
</script>

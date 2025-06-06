<template>  <article class="mb-6 md:mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">    <!-- Post Header -->
    <div class="flex items-center justify-between p-3 md:p-4">
      <div class="flex items-center space-x-3">
        <div class="p-[2px] rounded-full bg-gradient-to-tr from-instagram-yellow via-instagram-orange to-instagram-pink">
          <img :src="post.avatar" :alt="post.username" class="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover border-2 border-white" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900 hover:text-instagram-purple cursor-pointer transition-colors">{{ post.username }}</h3>
          <p class="text-xs text-gray-500">{{ post.timeAgo }}</p>
        </div>
      </div>
      <button class="rounded-full p-2 transition-colors hover:bg-gray-100 active:scale-95">
        <svg class="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
          />
        </svg>
      </button>
    </div>    <!-- Post Image -->
    <div class="aspect-square relative overflow-hidden" @dblclick="handleDoubleTap">
      <img :src="post.image" alt="Post" class="h-full w-full object-cover select-none" />
      
      <!-- Double tap to like overlay -->
      <div v-if="showLikeAnimation" class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div class="relative">
          <svg class="h-20 w-20 text-red-500 drop-shadow-lg animate-ping" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <svg class="absolute inset-0 h-20 w-20 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Post Actions -->
    <div class="p-4">
      <div class="mb-3 flex items-center justify-between">        <div class="flex items-center space-x-4">
          <button class="transition-all duration-200 hover:scale-110 active:scale-95" @click="toggleLike">
            <svg
              class="h-6 w-6 transition-colors duration-200"
              :class="isLiked ? 'fill-red-500 text-red-500 drop-shadow-sm' : 'fill-none text-gray-800 hover:text-red-400'"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button class="transition-transform hover:scale-110">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
          <button class="transition-transform hover:scale-110">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <button class="transition-transform hover:scale-110">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>

      <p class="mb-2 text-sm font-semibold">
        {{ likesCount }}
        {{ likesCount === 1 ? 'like' : 'likes' }}
      </p>

      <div class="text-sm">
        <span class="font-semibold">{{ post.username }}</span>
        <span class="ml-2">{{ post.caption }}</span>
      </div>
      
      <!-- Tags -->
      <div v-if="post.tags && post.tags.length > 0" class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          #{{ tag }}
        </span>
      </div>
      
      <p class="mt-2 cursor-pointer text-sm text-gray-500 hover:text-gray-700">View all comments</p>      <!-- Add Comment -->
      <form class="mt-3 flex items-center border-t pt-3" @submit.prevent="handleComment">
        <input
          v-model="newComment"
          type="text"
          placeholder="Add a comment..."
          class="flex-1 py-2 px-3 text-sm outline-none border border-gray-200 rounded-full focus:border-instagram-pink focus:ring-2 focus:ring-instagram-pink/10 transition-all duration-200 hover:border-gray-300"
        />
        <button
          type="submit"
          class="ml-3 text-sm font-semibold text-instagram-pink hover:text-instagram-purple disabled:text-gray-400 transition-colors duration-200 px-3 py-2 rounded-full hover:bg-instagram-pink/10"
          :disabled="!newComment.trim()"
        >
          Post
        </button>
      </form>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Post {
  id: number
  username: string
  avatar: string
  image: string
  caption: string
  likes: number
  timeAgo: string
  tags?: string[]
}

interface Props {
  post: Post
}

const props = defineProps<Props>()

const isLiked = ref(false)
const likesCount = ref(props.post.likes)
const newComment = ref('')
const showLikeAnimation = ref(false)

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likesCount.value = isLiked.value ? likesCount.value + 1 : likesCount.value - 1
  
  // Show like animation
  if (isLiked.value) {
    showLikeAnimation.value = true
    setTimeout(() => {
      showLikeAnimation.value = false
    }, 1000)
  }
  
  // TODO: Send like/unlike to API
  // apiService.likePhoto(props.post.id.toString())
}

const handleDoubleTap = () => {
  if (!isLiked.value) {
    toggleLike()
  } else {
    // Still show animation even if already liked
    showLikeAnimation.value = true
    setTimeout(() => {
      showLikeAnimation.value = false
    }, 1000)
  }
}

const handleComment = () => {
  if (!newComment.value.trim()) return
  
  // TODO: Send comment to API
  console.log('Adding comment:', newComment.value)
  newComment.value = ''
}
</script>

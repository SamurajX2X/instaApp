<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <main class="mx-auto max-w-4xl py-8 px-4">
      <div class="bg-white rounded-lg shadow p-8">
        <!-- Profile Header -->
        <div class="flex flex-col md:flex-row gap-8 mb-8">
          <div class="flex-shrink-0">
            <div class="relative">
              <img
                :src="profileData.avatar || defaultAvatar"
                :alt="profileData.username"
                class="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
              />
              <button
                v-if="isOwnProfile"
                @click="triggerAvatarUpload"
                class="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                @change="handleAvatarUpload"
                class="hidden"
              />
            </div>
          </div>
          
          <div class="flex-1">
            <div class="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 class="text-2xl font-bold">{{ profileData.username }}</h1>
              <button
                v-if="isOwnProfile"
                @click="editMode = !editMode"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {{ editMode ? 'Cancel' : 'Edit Profile' }}
              </button>
            </div>
            
            <div class="grid grid-cols-3 gap-8 mb-4 text-center">
              <div>
                <div class="text-xl font-bold">{{ profileData.postsCount || 0 }}</div>
                <div class="text-gray-500">posts</div>
              </div>
              <div>
                <div class="text-xl font-bold">{{ profileData.followersCount || 0 }}</div>
                <div class="text-gray-500">followers</div>
              </div>
              <div>
                <div class="text-xl font-bold">{{ profileData.followingCount || 0 }}</div>
                <div class="text-gray-500">following</div>
              </div>
            </div>
            
            <div v-if="!editMode">
              <h2 class="font-semibold">{{ profileData.displayName || profileData.username }}</h2>
              <p class="text-gray-600 mt-1">{{ profileData.bio || 'No bio yet.' }}</p>
              <p v-if="profileData.website" class="text-purple-600 mt-1">
                <a :href="profileData.website" target="_blank" class="hover:underline">
                  {{ profileData.website }}
                </a>
              </p>
            </div>
            
            <!-- Edit Form -->
            <form v-else @submit.prevent="saveProfile" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  v-model="editForm.displayName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  v-model="editForm.bio"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  v-model="editForm.website"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div class="flex gap-3">
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Posts Grid -->
        <div class="border-t pt-8">
          <div class="flex justify-center mb-8">
            <div class="flex space-x-8">
              <button class="flex items-center space-x-2 text-sm font-medium border-t-2 border-purple-600 pt-4">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
                <span>POSTS</span>
              </button>
            </div>
          </div>
          
          <div v-if="userPosts.length > 0" class="grid grid-cols-3 gap-4">
            <div 
              v-for="post in userPosts" 
              :key="post.id"
              class="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
              @click="openPost(post)"
            >
              <img
                :src="post.image"
                :alt="post.caption"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div v-else class="text-center py-16 text-gray-500">
            <svg class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p>No posts yet</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePostsStore } from '../stores/posts'
import { storeToRefs } from 'pinia'
import Header from '../components/Header.vue'
import { apiService } from '../services/api'

const route = useRoute()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const { user } = storeToRefs(authStore)
const { posts } = storeToRefs(postsStore)

const profileData = ref({
  username: '',
  displayName: '',
  bio: '',
  website: '',
  avatar: '',
  postsCount: 0,
  followersCount: 0,
  followingCount: 0
})

const editMode = ref(false)
const saving = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

const editForm = ref({
  displayName: '',
  bio: '',
  website: ''
})

const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

const isOwnProfile = computed(() => {
  const routeUsername = route.params.username as string
  return !routeUsername || routeUsername === user.value?.name
})

const userPosts = computed(() => {
  return posts.value.filter(post => post.username === profileData.value.username)
})

const loadProfile = async () => {
  const username = route.params.username as string || user.value?.name
  
  if (!username) return
  
  try {
    if (isOwnProfile.value && user.value) {
      // Ładowanie profilu z lokalnego magazynu
      profileData.value = {
        username: user.value.name,
        displayName: user.value.name,
        bio: '',
        website: '',
        avatar: user.value.avatar || defaultAvatar,
        postsCount: userPosts.value.length,
        followersCount: 0,
        followingCount: 0
      }
    } else {
      // Ładowanie profilu z API
      const response = await apiService.profile.get(username)
      if (response.success && response.data) {
        const data = response.data as any
        profileData.value = {
          username: data.username || '',
          displayName: data.displayName || '',
          bio: data.bio || '',
          website: data.website || '',
          avatar: data.avatar || defaultAvatar,
          postsCount: data.postsCount || 0,
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0
        }
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// Przesyłanie nowego avatara
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  const formData = new FormData()
  formData.append('avatar', file)
  
  try {
    // TODO: Implementacja przesyłania avatara
    console.log('Uploading avatar:', file.name)
  } catch (error) {
    console.error('Avatar upload error:', error)
  }
}

const startEdit = () => {
  editForm.value = {
    displayName: profileData.value.displayName,
    bio: profileData.value.bio,
    website: profileData.value.website
  }
  editMode.value = true
}

const cancelEdit = () => {
  editMode.value = false
  editForm.value = {
    displayName: '',
    bio: '',
    website: ''
  }
}

// Zapis profilu użytkownika
const saveProfile = async () => {
  saving.value = true
  
  try {
    const response = await apiService.profile.update(editForm.value)
    
    if (response.success && response.data) {
      const data = response.data as any
      profileData.value = {
        ...profileData.value,
        ...data
      }
      editMode.value = false
    } else {
      alert('Failed to update profile: ' + response.error)
    }
  } catch (error) {
    console.error('Profile update error:', error)
    alert('Failed to update profile')
  } finally {
    saving.value = false
  }
}

const openPost = (post: any) => {
  console.log('Opening post:', post.id)
}

onMounted(() => {
  loadProfile()
  postsStore.fetchPosts()
})
</script>

<template>
  <div v-if="show" class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
    <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 class="text-lg font-semibold">Upload New Photo</h2>
        <button @click="closeModal" class="text-gray-500 transition-colors hover:text-gray-700">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div v-if="!previewUrl">
          <!-- File Drop Zone -->            <div
            class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors"
            :class="{ 'border-primary bg-primary/5': dragActive }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
          >
            <svg
              class="mx-auto mb-4 h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p class="mb-2 text-lg font-medium text-gray-700">Drop your photo here</p>
            <p class="mb-4 text-sm text-gray-500">or click to browse</p>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
              id="photo-upload"
            />            <label
              for="photo-upload"
              class="inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-600"
            >
              Choose Photo
            </label>
          </div>
        </div>
        
        <div v-else>
          <!-- Preview and Form -->
          <div class="space-y-4">
            <!-- Image Preview -->
            <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img :src="previewUrl" alt="Preview" class="h-full w-full object-cover" />
            </div>

            <!-- Form Fields -->
            <div>
              <label for="caption" class="mb-2 block text-sm font-medium text-gray-700">
                Caption
              </label>              <textarea
                id="caption"
                v-model="caption"
                placeholder="Write a caption..."
                class="w-full resize-none rounded-lg border-2 border-gray-200 px-3 py-2 focus:outline-none focus:border-instagram-pink focus:ring-2 focus:ring-instagram-pink/10 transition-all duration-200 hover:border-gray-300"
                rows="3"
              />
            </div>

            <div>
              <label for="album" class="mb-2 block text-sm font-medium text-gray-700">
                Album (optional)
              </label>              <input
                id="album"
                type="text"
                v-model="album"
                placeholder="Enter album name"
                class="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:outline-none focus:border-instagram-pink focus:ring-2 focus:ring-instagram-pink/10 transition-all duration-200 hover:border-gray-300"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4">
              <button
                @click="closeModal"
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                :disabled="isUploading"
              >
                Cancel
              </button>              <button
                @click="handleUpload"
                :disabled="isUploading"
                class="flex-1 rounded-lg bg-gradient-to-r from-instagram-purple via-instagram-pink to-instagram-orange px-4 py-2 text-white transition-all duration-300 hover:shadow-lg hover:shadow-instagram-pink/25 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
              >
                <div v-if="isUploading" class="flex items-center justify-center">
                  <svg
                    class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </div>
                <span v-else>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiService } from '../services/api'
import { usePostsStore } from '../stores/posts'
import { useAuthStore } from '../stores/auth'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const postsStore = usePostsStore()
const authStore = useAuthStore()

const files = ref<FileList | null>(null)
const caption = ref('')
const album = ref('')
const isUploading = ref(false)
const dragActive = ref(false)
const previewUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    files.value = target.files
    createPreview()
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragActive.value = false

  if (event.dataTransfer?.files) {
    files.value = event.dataTransfer.files
    createPreview()
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragActive.value = true
}

const handleDragLeave = () => {
  dragActive.value = false
}

const createPreview = () => {
  if (files.value && files.value[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(files.value[0])
  }
}

const handleUpload = async () => {
  if (!files.value || files.value.length === 0) return

  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('photo', files.value[0])
    formData.append('caption', caption.value)
    formData.append('album', album.value || 'default')

    const response = await apiService.photos.upload(formData)

    if (response.success) {
      // Add to store
      const newPost = {
        id: Date.now(),
        username: authStore.user?.name || 'john_doe',
        avatar: authStore.user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        image: previewUrl.value || '',
        caption: caption.value,
        likes: 0,
        timeAgo: 'now'
      }

      postsStore.addPost(newPost)
      closeModal()
      
      // Refresh posts from server
      await postsStore.fetchPosts()
    } else {
      alert('Upload failed: ' + response.error)
    }
  } catch (error) {
    console.error('Upload error:', error)
    alert('Upload failed')
  } finally {
    isUploading.value = false
  }
}

const closeModal = () => {
  emit('update:show', false)
  files.value = null
  caption.value = ''
  album.value = ''
  previewUrl.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

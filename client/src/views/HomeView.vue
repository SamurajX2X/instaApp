<template>
  <div class="home-container">
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <div>Loading posts...</div>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">{{ error }}</div>
      <button @click="fetchPosts" class="retry-button">Try Again</button>
    </div>

    <div v-else-if="!posts.length" class="empty-state">
      <div class="empty-icon">📷</div>
      <h2>No Photos Yet</h2>
      <p>There are no photos to display.</p>
      <button @click="openUploadModal" class="upload-button">Upload Photo</button>
    </div>

    <div v-else class="posts-container">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <div class="post-user-info">
            <img :src="post.avatar" alt="User Avatar" class="avatar" />
            <span class="username">{{ post.username }}</span>
          </div>
          <div class="post-actions">
            <button @click="deletePost(post.id)" class="delete-button">
              <span class="delete-icon">✕</span>
            </button>
          </div>
        </div>
        
        <div class="post-image-container">
          <img :src="post.image" :alt="post.caption" class="post-image" />
        </div>
        
        <div class="post-details">
          <div class="post-actions-row">
            <button @click="likePost(post.id)" class="action-button">❤️ {{ post.likes }}</button>
            <span class="post-time">{{ post.timeAgo }}</span>
          </div>
          
          <div class="post-caption">
            <span class="username">{{ post.username }}</span>
            <span>{{ post.caption }}</span>
          </div>
          
          <div v-if="post.tags && post.tags.length" class="post-tags">
            <span 
              v-for="tag in post.tags" 
              :key="tag.id || tag" 
              class="tag"
            >
              {{ typeof tag === 'string' ? tag : tag.name }}
            </span>
          </div>

          <div class="add-tag-form">
            <input 
              type="text" 
              v-model="newTags[post.id]" 
              placeholder="Add tag..." 
              class="tag-input" 
              @keyup.enter="addTag(post.id)"
            />
            <button @click="addTag(post.id)" class="add-tag-button">+</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showUploadModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Upload Photo</h2>
          <button @click="closeUploadModal" class="close-button">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="uploadPhoto">
            <div class="form-group">
              <label for="file">Choose Photo</label>
              <input 
                type="file" 
                id="file" 
                @change="handleFileChange" 
                accept="image/*" 
                required
              />
              
              <div v-if="selectedFile" class="file-preview">
                <p>{{ selectedFile.name }}</p>
              </div>
            </div>
            
            <div class="form-group">
              <label for="album">Album</label>
              <input 
                type="text" 
                id="album" 
                v-model="uploadForm.album" 
                placeholder="Enter album name"
                required
              />
            </div>
            
            <button type="submit" class="upload-button" :disabled="uploading">
              <template v-if="!uploading">Upload</template>
              <template v-else>
                Uploading...
                <span class="loader"></span>
              </template>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { usePostsStore } from '../stores/posts'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'HomeView',
  setup() {
    const postsStore = usePostsStore()
    const authStore = useAuthStore()
    
    // store postow
    const posts = computed(() => postsStore.posts)
    const loading = computed(() => postsStore.loading)
    const error = computed(() => postsStore.error)
    
    // tagi
    const newTags = ref({})
    
    // modale i uploadowanie
    const showUploadModal = ref(false)
    const uploading = ref(false)
    const selectedFile = ref(null)
    const uploadForm = ref({
      album: '',
      file: null
    })
    
    const fetchPosts = async () => {
      await postsStore.fetchPosts()
    }
    
    const deletePost = async (id) => {
      if (confirm('Are you sure you want to delete this post')) {
        await postsStore.deletePost(id)
      }
    }
    
    const likePost = async (id) => {
      await postsStore.likePost(id)
    }
    
    const addTag = async (postId) => {
      if (!newTags.value[postId] || newTags.value[postId].trim() === '') return
      
      const tagName = newTags.value[postId]
      
      // wyszukiwanie
      const post = posts.value.find(p => p.id === postId)
      if (!post) return
      
      // dodawanie tagow
      if (!post.tags) post.tags = []
      post.tags.push(tagName)
      
     
      newTags.value[postId] = ''
    }
    
    const openUploadModal = () => {
      showUploadModal.value = true
    }
    
    const closeUploadModal = () => {
      showUploadModal.value = false
      selectedFile.value = null
      uploadForm.value.album = ''
      uploadForm.value.file = null
    }
    
    const handleFileChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        selectedFile.value = file
        uploadForm.value.file = file
      }
    }
    
    const uploadPhoto = async () => {
      if (!uploadForm.value.file || !uploadForm.value.album) return
      
      uploading.value = true
      
      try {
        const formData = new FormData()
        formData.append('file', uploadForm.value.file)
        formData.append('album', uploadForm.value.album)
        
        const result = await postsStore.uploadPost(formData)
        
        if (result.success) {
          closeUploadModal()
        } else {
          alert(result.error || 'Upload failed. Please try again.')
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('An unexpected error occurred. Please try again.')
      } finally {
        uploading.value = false
      }
    }
    
    onMounted(() => {
      fetchPosts()
    })
    
    return {
      posts,
      loading,
      error,
      newTags,
      showUploadModal,
      uploading,
      selectedFile,
      uploadForm,
      fetchPosts,
      deletePost,
      likePost,
      addTag,
      openUploadModal,
      closeUploadModal,
      handleFileChange,
      uploadPhoto
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container, .error-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  width: 100%;
  text-align: center;
}

.retry-button, .upload-button {
  padding: 8px 16px;
  background-color: #0095f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  background-color: white;
  overflow: hidden;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #dbdbdb;
}

.post-user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.username {
  font-weight: 600;
}

.post-image-container {
  width: 100%;
  position: relative;
}

.post-image {
  width: 100%;
  display: block;
}

.post-details {
  padding: 12px;
}

.post-actions-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.action-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.post-time {
  color: #8e8e8e;
  font-size: 14px;
}

.post-caption {
  margin-bottom: 8px;
  font-size: 14px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag {
  background-color: #efefef;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.add-tag-form {
  display: flex;
  margin-top: 12px;
}

.tag-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #dbdbdb;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}

.add-tag-button {
  background-color: #0095f6;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 12px;
  cursor: pointer;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #8e8e8e;
  font-size: 18px;
  padding: 4px;
}

.delete-icon {
  font-size: 14px;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #dbdbdb;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.file-preview {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.loader {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-left: 8px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

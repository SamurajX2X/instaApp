<template>
  <div id="app">
    <Navbar @open-upload="showUploadModal = true" />
    <main class="container">
      <router-view />
    </main>
    <Footer />
    
    <div v-if="showUploadModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Upload Photo</h2>
          <button @click="showUploadModal = false" class="close-button">&times;</button>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { api } from './services/api'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  setup() {
    const router = useRouter()
    
    const showUploadModal = ref(false)
    const uploading = ref(false)
    const selectedFile = ref(null)
    const uploadForm = ref({
      album: '',
      file: null
    })
    
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
        
        const result = await api.photos.upload(formData)
        
        if (result.success) {
          showUploadModal.value = false
          selectedFile.value = null
          uploadForm.value.album = ''
          uploadForm.value.file = null
          
          router.push('/')
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
    
    return {
      showUploadModal,
      uploading,
      selectedFile,
      uploadForm,
      handleFileChange,
      uploadPhoto
    }
  }
}
</script>

<style>
@import './assets/base.css';
@import './styles/main.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #fafafa;
  color: #262626;
  line-height: 1.5;
}

.container {
  max-width: 935px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 60px - 100px);
}

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
  border-radius: 12px;
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

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
}

.file-preview {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.upload-button {
  background: linear-gradient(45deg, #8a3ab9, #e95950, #fccc63);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

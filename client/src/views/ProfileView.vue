<template>
  <div class="profile-container">
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <div>Loading profile...</div>
    </div>

    <div v-else class="profile-content">
      <div class="profile-header">
        <div class="avatar-container">
          <img 
            :src="profileData.avatar || defaultAvatar" 
            alt="Profile Picture" 
            class="avatar"
          />
          <button 
            v-if="isOwnProfile" 
            @click="openUploadModal" 
            class="change-avatar-btn"
          >
            Change Photo
          </button>
        </div>

        <div class="profile-info">
          <h1 class="username">{{ profileData.username }}</h1>
          
          <div class="profile-stats">
            <div class="stat-item">
              <span class="count">{{ profileData.postsCount }}</span>
              <span class="label">posts</span>
            </div>
            <div class="stat-item">
              <span class="count">{{ profileData.followersCount }}</span>
              <span class="label">followers</span>
            </div>
            <div class="stat-item">
              <span class="count">{{ profileData.followingCount }}</span>
              <span class="label">following</span>
            </div>
          </div>
          
          <div class="profile-details">
            <p class="display-name">{{ profileData.displayName }}</p>
            <p v-if="profileData.bio" class="bio">{{ profileData.bio }}</p>
            <a 
              v-if="profileData.website" 
              :href="profileData.website" 
              target="_blank" 
              class="website"
            >
              {{ profileData.website }}
            </a>
          </div>
          
          <button 
            v-if="isOwnProfile" 
            @click="openEditModal" 
            class="edit-profile-btn"
          >
            Edit Profile
          </button>
        </div>
      </div>
      
      <div class="profile-posts-header">
        <h2>Posts</h2>
      </div>
      
      <div v-if="userPosts.length === 0" class="empty-posts">
        <div class="empty-icon">📷</div>
        <p>No posts yet</p>
        <button 
          v-if="isOwnProfile"
          @click="$router.push('/')" 
          class="upload-btn"
        >
          Upload a Photo
        </button>
      </div>
      
      <div v-else class="profile-posts">
        <div 
          v-for="post in userPosts" 
          :key="post.id" 
          class="post-item"
        >
          <img :src="post.image" :alt="post.caption" class="post-image" />
        </div>
      </div>
    </div>

    <!-- Profile Photo Upload Modal -->
    <div v-if="showUploadModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Change Profile Photo</h2>
          <button @click="closeUploadModal" class="close-button">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="uploadProfilePhoto">
            <div class="form-group">
              <label for="profile-photo">Choose Photo</label>
              <input 
                type="file" 
                id="profile-photo" 
                @change="handleFileChange" 
                accept="image/*" 
                required
              />
              
              <div v-if="selectedFile" class="file-preview">
                <p>{{ selectedFile.name }}</p>
              </div>
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

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Profile</h2>
          <button @click="closeEditModal" class="close-button">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="displayName">Name</label>
              <input 
                type="text" 
                id="displayName" 
                v-model="editForm.displayName" 
                placeholder="Your name"
              />
            </div>
            
            <div class="form-group">
              <label for="bio">Bio</label>
              <textarea 
                id="bio" 
                v-model="editForm.bio" 
                placeholder="Write something about yourself"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="website">Website</label>
              <input 
                type="url" 
                id="website" 
                v-model="editForm.website" 
                placeholder="Your website URL"
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="editForm.email" 
                placeholder="Your email"
                disabled
              />
            </div>
            
            <button type="submit" class="save-button" :disabled="updating">
              <template v-if="!updating">Save Changes</template>
              <template v-else>
                Saving...
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
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePostsStore } from '../stores/posts'
import apiService from '../services/api'

export default {
  name: 'ProfileView',
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    const postsStore = usePostsStore()

    // Default avatar
    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
    
    // State
    const loading = ref(true)
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
    
    // User posts
    const userPosts = computed(() => {
      return postsStore.posts.filter(post => post.username === profileData.value.username)
    })
    
    // Modal states
    const showUploadModal = ref(false)
    const showEditModal = ref(false)
    const uploading = ref(false)
    const updating = ref(false)
    const selectedFile = ref(null)
    
    // Edit form data
    const editForm = ref({
      displayName: '',
      bio: '',
      website: '',
      email: ''
    })
    
    // Compute if the profile is the logged-in user's profile
    const user = computed(() => authStore.user)
    const isOwnProfile = computed(() => {
      return !route.params.username || route.params.username === user.value?.name
    })
    
    const loadProfile = async () => {
      loading.value = true
      
      try {
        const username = route.params.username || user.value?.name
        
        if (!username) return
        
        if (isOwnProfile.value && user.value) {
          // Load profile from local store for own profile
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
          
          // Set edit form data
          editForm.value = {
            displayName: user.value.name,
            bio: '',
            website: '',
            email: user.value.email
          }
        } else {
          // In a real app, this would fetch profile from the API
          const response = await mockProfileApi(username)
          
          if (response.success) {
            profileData.value = response.data
          } else {
            console.error('Error loading profile:', response.error)
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        loading.value = false
      }
    }
    
    const mockProfileApi = async (username) => {
      // Mock API response
      return {
        success: true,
        data: {
          username: username,
          displayName: username,
          bio: 'This is a mock bio',
          website: 'https://example.com',
          avatar: defaultAvatar,
          postsCount: Math.floor(Math.random() * 50),
          followersCount: Math.floor(Math.random() * 1000),
          followingCount: Math.floor(Math.random() * 500)
        }
      }
    }
    
    // Upload modal
    const openUploadModal = () => {
      showUploadModal.value = true
    }
    
    const closeUploadModal = () => {
      showUploadModal.value = false
      selectedFile.value = null
    }
    
    const handleFileChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        selectedFile.value = file
      }
    }
    
    const uploadProfilePhoto = async () => {
      if (!selectedFile.value) return
      
      uploading.value = true
      
      try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        
        // In a real app, this would call the API
        // const response = await apiService.profile.uploadPhoto(formData)
        
        // Mock successful upload
        setTimeout(() => {
          // Update avatar in UI
          profileData.value.avatar = URL.createObjectURL(selectedFile.value)
          
          // Close modal
          closeUploadModal()
          uploading.value = false
        }, 1500)
      } catch (error) {
        console.error('Error uploading profile photo:', error)
        alert('Failed to upload profile photo. Please try again.')
        uploading.value = false
      }
    }
    
    // Edit profile modal
    const openEditModal = () => {
      // Populate form with current values
      editForm.value = {
        displayName: profileData.value.displayName,
        bio: profileData.value.bio,
        website: profileData.value.website,
        email: user.value?.email || ''
      }
      
      showEditModal.value = true
    }
    
    const closeEditModal = () => {
      showEditModal.value = false
    }
    
    const updateProfile = async () => {
      updating.value = true
      
      try {
        // In a real app, this would call the API
        // const response = await apiService.profile.update(editForm.value)
        
        // Mock successful update
        setTimeout(() => {
          // Update profile data in UI
          profileData.value = {
            ...profileData.value,
            displayName: editForm.value.displayName,
            bio: editForm.value.bio,
            website: editForm.value.website
          }
          
          // Close modal
          closeEditModal()
          updating.value = false
        }, 1500)
      } catch (error) {
        console.error('Error updating profile:', error)
        alert('Failed to update profile. Please try again.')
        updating.value = false
      }
    }
    
    onMounted(() => {
      loadProfile()
      postsStore.fetchPosts()
    })
    
    return {
      loading,
      profileData,
      userPosts,
      defaultAvatar,
      showUploadModal,
      showEditModal,
      uploading,
      updating,
      selectedFile,
      editForm,
      isOwnProfile,
      openUploadModal,
      closeUploadModal,
      handleFileChange,
      uploadProfilePhoto,
      openEditModal,
      closeEditModal,
      updateProfile
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 935px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.profile-header {
  display: flex;
  margin-bottom: 44px;
}

.avatar-container {
  margin-right: 30px;
  text-align: center;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.change-avatar-btn {
  display: block;
  margin-top: 10px;
  background: none;
  border: none;
  color: #0095f6;
  cursor: pointer;
  font-size: 14px;
}

.profile-info {
  flex: 1;
}

.username {
  font-size: 28px;
  font-weight: 300;
  margin-bottom: 20px;
}

.profile-stats {
  display: flex;
  margin-bottom: 20px;
}

.stat-item {
  margin-right: 40px;
}

.count {
  font-weight: 600;
  margin-right: 5px;
}

.label {
  color: #262626;
}

.profile-details {
  margin-bottom: 20px;
}

.display-name {
  font-weight: 600;
  margin-bottom: 5px;
}

.bio {
  margin-bottom: 5px;
}

.website {
  color: #00376b;
  font-weight: 600;
  text-decoration: none;
}

.edit-profile-btn {
  background-color: transparent;
  border: 1px solid #dbdbdb;
  color: #262626;
  border-radius: 4px;
  font-weight: 600;
  padding: 5px 9px;
  cursor: pointer;
}

.profile-posts-header {
  border-top: 1px solid #dbdbdb;
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-bottom: 20px;
}

.profile-posts-header h2 {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.empty-posts {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-btn {
  margin-top: 16px;
  background-color: #0095f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  font-weight: 600;
  cursor: pointer;
}

.profile-posts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.post-item {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Square aspect ratio */
  overflow: hidden;
}

.post-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
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

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #0095f6;
}

.save-button, .upload-button {
  width: 100%;
  padding: 8px;
  background-color: #0095f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.file-preview {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
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

@media (max-width: 735px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
  }
  
  .avatar-container {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .profile-info {
    text-align: center;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .profile-posts {
    grid-template-columns: repeat(2, 1fr);
    gap: 3px;
  }
}

@media (max-width: 480px) {
  .profile-posts {
    grid-template-columns: 1fr;
  }
}
</style>

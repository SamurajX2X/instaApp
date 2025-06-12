<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <router-link to="/" class="navbar-brand">InstaApp</router-link>
      </div>
      
      <div v-if="isLoggedIn" class="navbar-right">
        <div class="navbar-search">
          <input type="text" placeholder="Search..." />
        </div>
        
        <div class="navbar-links">
          <router-link to="/" class="nav-link" title="Home">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </router-link>
          
          <router-link to="/tags" class="nav-link" title="Tags">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </router-link>
          
          <button @click="openUploadDialog" class="nav-link" title="Upload Photo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>
          
          <router-link to="/profile" class="nav-link profile-link" title="Profile">
            <img :src="userAvatar" alt="Profile" class="profile-avatar" />
          </router-link>
          
          <button @click="logout" class="nav-link" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div v-else class="navbar-right">
        <router-link to="/login" class="login-button">Log In</router-link>
        <router-link to="/register" class="register-button">Sign Up</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Navbar',
  emits: ['open-upload'],
  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isLoggedIn = computed(() => authStore.isLoggedIn)
    
    const user = computed(() => authStore.user)
    
    const userAvatar = computed(() => {
      return user.value?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
    })
    
    const openUploadDialog = () => {
      emit('open-upload')
    }
    
    const logout = async () => {
      authStore.logout()
      router.push('/login')
    }
    
    return {
      isLoggedIn,
      userAvatar,
      openUploadDialog,
      logout
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #dbdbdb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 975px;
  margin: 0 auto;
  padding: 10px 20px;
  height: 60px;
}

.navbar-brand {
  color: #262626;
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.navbar-search {
  margin-right: 16px;
}

.navbar-search input {
  background-color: #efefef;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  width: 215px;
}

.navbar-search input:focus {
  outline: none;
}

.navbar-links {
  display: flex;
  align-items: center;
}

.nav-link {
  color: #262626;
  margin-left: 22px;
  text-decoration: none;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.profile-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.login-button, .register-button {
  padding: 6px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.login-button {
  color: #0095f6;
  margin-right: 8px;
}

.register-button {
  background-color: #0095f6;
  color: white;
}

@media (max-width: 735px) {
  .navbar-search {
    display: none;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 10px;
  }
  
  .navbar-brand {
    font-size: 20px;
  }
  
  .nav-link {
    margin-left: 14px;
  }
}
</style>

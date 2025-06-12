<template>
  <div class="tags-container">
    <div class="tags-header">
      <h1>Available Tags</h1>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Loading tags...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">{{ error }}</div>
      <button @click="fetchTags" class="retry-button">Try Again</button>
    </div>

    <div v-else class="tags-content">
      <div class="tags-list-container">
        <div class="list-header">
          <h2>All Tags</h2>
          <div class="search-input">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search tags..." 
            />
          </div>
        </div>
        
        <div v-if="filteredTags.length === 0" class="empty-list">
          <p v-if="searchQuery">No tags match your search.</p>
          <p v-else>No tags available. Tags are added to photos directly.</p>
        </div>
        
        <div v-else class="tags-list">
          <div 
            v-for="tag in filteredTags" 
            :key="tag.id || tag.name" 
            class="tag-item"
          >
            <div class="tag-name">{{ tag.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'TagsView',
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const tags = ref([]); // Stores unique tag names
    const searchQuery = ref('');

    const filteredTags = computed(() => {
      if (!searchQuery.value) {
        return tags.value;
      }
      const query = searchQuery.value.toLowerCase();
      return tags.value.filter(tag => 
        tag.name.toLowerCase().includes(query)
      );
    });

    const fetchTags = async () => {
      loading.value = true;
      error.value = null;
      try {
        // Replace with actual API call: e.g., const response = await apiService.tags.getAllUnique();
        // This endpoint should return a list of unique tag objects/strings.
        // For now, using mock data and assuming photos have tags.
        // In a real scenario, the server would aggregate unique tags from all photos.
        setTimeout(() => {
          // Example: Simulate fetching unique tags from photos
          const allPhotoTags = [ // This would come from your photos data
            { id: 1, name: '#nature' }, { id: 2, name: '#travel' }, { id: 3, name: '#photography' },
            { id: 1, name: '#nature' }, { id: 4, name: '#food' }, { id: 3, name: '#photography' }
          ];
          const uniqueTagsMap = new Map();
          allPhotoTags.forEach(tag => {
            if (!uniqueTagsMap.has(tag.name)) {
              uniqueTagsMap.set(tag.name, tag);
            }
          });
          tags.value = Array.from(uniqueTagsMap.values());
          loading.value = false;
        }, 1000);
      } catch (err) {
        console.error('Error fetching tags:', err);
        error.value = 'Failed to load tags. Please try again.';
        loading.value = false;
      }
    };

    onMounted(fetchTags);

    return {
      loading,
      error,
      searchQuery,
      filteredTags,
      fetchTags,
    };
  }
}
</script>

<style scoped>
.tags-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tags-header h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.loading-container, .error-container, .empty-list {
  text-align: center;
  padding: 20px;
  color: #666;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.retry-button:hover {
  background-color: #2980b9;
}

.tags-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-header h2 {
  margin: 0;
  color: #444;
}

.search-input input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  background-color: #e9ecef;
  padding: 8px 12px;
  border-radius: 15px;
  font-size: 0.9em;
  color: #333;
  cursor: default; /* Or make them clickable to filter photos by tag */
}

.tag-name {
  font-weight: 500;
}
</style>

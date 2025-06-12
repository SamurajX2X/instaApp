<template>
  <div class="editor-container">
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Loading image...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">{{ error }}</div>
      <button @click="$router.push('/')" class="back-button">Back to Home</button>
    </div>

    <div v-else class="editor-content">
      <div class="editor-header">
        <h1>Photo Editor</h1>
        <button @click="$router.push('/')" class="back-button">Cancel</button>
      </div>

      <div class="editor-main">
        <div class="image-preview">
          <img :src="currentImageUrl" alt="Photo Preview" />
        </div>

        <div class="editor-sidebar">
          <h2>Filters</h2>
          
          <div class="filters-grid">
            <div 
              v-for="filter in filters" 
              :key="filter.name"
              class="filter-item"
              :class="{ active: selectedFilter === filter.name }"
              @click="applyFilter(filter.name)"
            >
              <div class="filter-name">{{ filter.label }}</div>
            </div>
          </div>
          
          <div v-if="showFilterControls" class="filter-controls">
            <h3>{{ selectedFilter }} Settings</h3>
            
            <!-- Brightness, Saturation, Hue controls for modulate filter -->
            <div v-if="selectedFilter === 'modulate'" class="filter-sliders">
              <div class="slider-group">
                <label for="brightness">Brightness</label>
                <input 
                  type="range" 
                  id="brightness" 
                  v-model="filterSettings.brightness" 
                  min="0.5" 
                  max="1.5" 
                  step="0.1"
                  @change="updateFilter"
                />
                <span>{{ filterSettings.brightness }}</span>
              </div>
              
              <div class="slider-group">
                <label for="saturation">Saturation</label>
                <input 
                  type="range" 
                  id="saturation" 
                  v-model="filterSettings.saturation" 
                  min="0.5" 
                  max="1.5" 
                  step="0.1"
                  @change="updateFilter"
                />
                <span>{{ filterSettings.saturation }}</span>
              </div>
              
              <div class="slider-group">
                <label for="hue">Hue</label>
                <input 
                  type="range" 
                  id="hue" 
                  v-model="filterSettings.hue" 
                  min="0" 
                  max="360" 
                  step="15"
                  @change="updateFilter"
                />
                <span>{{ filterSettings.hue }}°</span>
              </div>
            </div>
            
            <!-- Angle control for rotate filter -->
            <div v-else-if="selectedFilter === 'rotate'" class="filter-sliders">
              <div class="slider-group">
                <label for="angle">Angle</label>
                <input 
                  type="range" 
                  id="angle" 
                  v-model="filterSettings.angle" 
                  min="0" 
                  max="360" 
                  step="90"
                  @change="updateFilter"
                />
                <span>{{ filterSettings.angle }}°</span>
              </div>
            </div>
            
            <!-- Sigma control for blur filter -->
            <div v-else-if="selectedFilter === 'blur'" class="filter-sliders">
              <div class="slider-group">
                <label for="sigma">Blur Amount</label>
                <input 
                  type="range" 
                  id="sigma" 
                  v-model="filterSettings.sigma" 
                  min="0.3" 
                  max="10" 
                  step="0.1"
                  @change="updateFilter"
                />
                <span>{{ filterSettings.sigma }}</span>
              </div>
            </div>
            
            <!-- Color controls for tint filter -->
            <div v-else-if="selectedFilter === 'tint'" class="filter-sliders">
              <div class="color-group">
                <label for="red">Red</label>
                <input 
                  type="range" 
                  id="red" 
                  v-model="filterSettings.r" 
                  min="0" 
                  max="255" 
                  step="1"
                  @change="updateFilter"
                />
                <span>{{ filterSettings.r }}</span>
              </div>
              
              <div class="color-group">
                <label for="green">Green</label>
                <input 
                  type="range" 
                  id="green" 
                  v-model="filterSettings.g" 
                  min="0" 
                  max="255" 
                  step="1"
                  @change="updateFilter"
                />
                <span>{{ filterSettings.g }}</span>
              </div>
              
              <div class="color-group">
                <label for="blue">Blue</label>
                <input 
                  type="range" 
                  id="blue" 
                  v-model="filterSettings.b" 
                  min="0" 
                  max="255" 
                  step="1"
                  @change="updateFilter"
                />
                <span>{{ filterSettings.b }}</span>
              </div>
              
              <div class="color-preview" :style="{ backgroundColor: rgbColor }"></div>
            </div>
            
            <!-- Format selection for reformat filter -->
            <div v-else-if="selectedFilter === 'reformat'" class="format-selectors">
              <div 
                v-for="format in formats" 
                :key="format"
                class="format-option"
                :class="{ active: filterSettings.format === format }"
                @click="selectFormat(format)"
              >
                {{ format.toUpperCase() }}
              </div>
            </div>
          </div>
          
          <div class="editor-actions">
            <button @click="resetImage" class="reset-button">Reset</button>
            <button @click="saveImage" class="save-button">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'PhotoEditorView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const photoId = computed(() => route.params.id)
    const loading = ref(true)
    const error = ref(null)
    
    // Image URLs
    const originalImageUrl = ref('')
    const currentImageUrl = ref('')
    const baseUrl = 'http://localhost:3000/api/getimage'
    
    // Filter state
    const selectedFilter = ref('')
    const showFilterControls = computed(() => !!selectedFilter.value)
    
    // Filter settings
    const filterSettings = ref({
      // Modulate filter
      brightness: 1.0,
      saturation: 1.0,
      hue: 0,
      
      // Rotate filter
      angle: 90,
      
      // Blur filter
      sigma: 5,
      
      // Tint filter
      r: 255,
      g: 0,
      b: 0,
      
      // Reformat filter
      format: 'png'
    })
    
    // Computed RGB color for tint preview
    const rgbColor = computed(() => {
      return `rgb(${filterSettings.value.r}, ${filterSettings.value.g}, ${filterSettings.value.b})`
    })
    
    // Available filters
    const filters = [
      { name: 'grayscale', label: 'Grayscale' },
      { name: 'negate', label: 'Negative' },
      { name: 'rotate', label: 'Rotate' },
      { name: 'blur', label: 'Blur' },
      { name: 'sharpen', label: 'Sharpen' },
      { name: 'modulate', label: 'Adjust' },
      { name: 'flip', label: 'Flip X' },
      { name: 'flop', label: 'Flip Y' },
      { name: 'tint', label: 'Tint' },
      { name: 'normalize', label: 'Auto Enhance' },
      { name: 'reformat', label: 'Convert' }
    ]
    
    // Available formats for reformat filter
    const formats = ['jpeg', 'png', 'webp', 'gif']
    
    // Load the image
    const loadImage = () => {
      if (!photoId.value) {
        error.value = 'No photo ID provided'
        loading.value = false
        return
      }
      
      try {
        // Set the original image URL
        originalImageUrl.value = `${baseUrl}/${photoId.value}`
        currentImageUrl.value = originalImageUrl.value
        
        // Simulate loading
        setTimeout(() => {
          loading.value = false
        }, 1000)
      } catch (err) {
        error.value = 'Failed to load the image'
        loading.value = false
        console.error('Error loading image:', err)
      }
    }
    
    // Apply a filter
    const applyFilter = (filterName) => {
      selectedFilter.value = filterName
      
      // For simple filters that don't need parameters
      if (['grayscale', 'negate', 'flip', 'flop', 'normalize', 'sharpen'].includes(filterName)) {
        currentImageUrl.value = `${baseUrl}/${photoId.value}/filter/${filterName}?t=${Date.now()}`
      }
    }
    
    // Update filter with parameters
    const updateFilter = () => {
      if (!selectedFilter.value) return
      
      let url = `${baseUrl}/${photoId.value}/filter/${selectedFilter.value}`
      
      // Add parameters based on the filter type
      switch (selectedFilter.value) {
        case 'modulate':
          url += `?brightness=${filterSettings.value.brightness}&saturation=${filterSettings.value.saturation}&hue=${filterSettings.value.hue}`
          break
        case 'rotate':
          url += `?angle=${filterSettings.value.angle}`
          break
        case 'blur':
          url += `?sigma=${filterSettings.value.sigma}`
          break
        case 'tint':
          url += `?r=${filterSettings.value.r}&g=${filterSettings.value.g}&b=${filterSettings.value.b}`
          break
      }
      
      // Add timestamp to prevent caching
      url += `&t=${Date.now()}`
      
      currentImageUrl.value = url
    }
    
    // Select format for reformat filter
    const selectFormat = (format) => {
      filterSettings.value.format = format
      currentImageUrl.value = `${baseUrl}/${photoId.value}/filter/reformat?format=${format}&t=${Date.now()}`
    }
    
    // Reset the image
    const resetImage = () => {
      selectedFilter.value = ''
      currentImageUrl.value = originalImageUrl.value
      
      // Reset filter settings to defaults
      filterSettings.value = {
        brightness: 1.0,
        saturation: 1.0,
        hue: 0,
        angle: 90,
        sigma: 5,
        r: 255,
        g: 0,
        b: 0,
        format: 'png'
      }
    }
    
    // Save the image
    const saveImage = () => {
      // In a real app, this would send a request to the server to save the filtered image
      alert('Image saved successfully!')
      router.push('/')
    }
    
    onMounted(() => {
      loadImage()
    })
    
    return {
      loading,
      error,
      currentImageUrl,
      selectedFilter,
      showFilterControls,
      filterSettings,
      filters,
      formats,
      rgbColor,
      applyFilter,
      updateFilter,
      selectFormat,
      resetImage,
      saveImage
    }
  }
}
</script>

<style scoped>
.editor-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  text-align: center;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  padding: 8px 16px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.editor-main {
  display: flex;
  gap: 20px;
}

.image-preview {
  flex: 2;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.image-preview img {
  max-width: 100%;
  max-height: 70vh;
  display: block;
}

.editor-sidebar {
  flex: 1;
  background-color: white;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.filter-item {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-item:hover {
  background-color: #e0e0e0;
}

.filter-item.active {
  background-color: #0095f6;
  color: white;
}

.filter-controls {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dbdbdb;
}

.filter-sliders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slider-group, .color-group {
  display: flex;
  align-items: center;
}

.slider-group label, .color-group label {
  flex: 1;
  margin-right: 8px;
}

.slider-group input, .color-group input {
  flex: 2;
}

.slider-group span, .color-group span {
  flex: 0.5;
  text-align: right;
}

.color-preview {
  height: 20px;
  width: 100%;
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #dbdbdb;
}

.format-selectors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.format-option {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}

.format-option.active {
  background-color: #0095f6;
  color: white;
}

.editor-actions {
  margin-top: auto;
  display: flex;
  gap: 10px;
}

.reset-button, .save-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
}

.reset-button {
  background-color: #e0e0e0;
}

.save-button {
  background-color: #0095f6;
  color: white;
}

.loader {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-radius: 50%;
  border-top: 4px solid #0095f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .editor-main {
    flex-direction: column;
  }
  
  .filters-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '../services/api'

interface Photo {
    id: number
    album: string
    originalName: string
    url: string
    lastChange: string
    history: Array<{
        status: string
        lastModifiedDate: number
    }>
    tags: string[]
}

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

export const usePostsStore = defineStore('posts', () => {
    const posts = ref<Post[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)    // Convert Photo data from server to Post format for UI
    function convertPhotoToPost(photo: Photo): Post {
        const baseUrl = 'http://localhost:3000/'
        const imageUrl = photo.url.replace(/\\\\/g, '/')

        return {
            id: photo.id,
            username: photo.album || 'Unknown User',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
            image: baseUrl + imageUrl,
            caption: photo.originalName,
            likes: 0,
            timeAgo: new Date(photo.history[photo.history.length - 1]?.lastModifiedDate || Date.now()).toLocaleDateString(),
            tags: photo.tags
        }
    } async function fetchPosts() {
        loading.value = true
        error.value = null

        try {
            const response = await apiService.photos.getAll()

            if (response.success && response.data) {
                const photos = response.data as Photo[]
                posts.value = photos.map(convertPhotoToPost)
            } else {
                error.value = response.error || 'Failed to fetch posts'
            }
        } catch (err) {
            error.value = 'Network error'
        } finally {
            loading.value = false
        }
    }

    async function uploadPost(formData: FormData) {
        loading.value = true
        error.value = null

        try {
            const response = await apiService.photos.upload(formData)

            if (response.success && response.data) {
                const newPhoto = response.data as Photo
                const newPost = convertPhotoToPost(newPhoto)
                addPost(newPost)
                return { success: true, data: newPost }
            } else {
                error.value = response.error || 'Failed to upload post'
                return { success: false, error: error.value }
            }
        } catch (err) {
            error.value = 'Network error'
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    async function deletePost(id: number) {
        try {
            const response = await apiService.photos.delete(id.toString())

            if (response.success) {
                removePost(id)
                return { success: true }
            } else {
                return { success: false, error: response.error || 'Failed to delete post' }
            }
        } catch (err) {
            return { success: false, error: 'Network error' }
        }
    }

    async function likePost(id: number) {
        try {
            const response = await apiService.photos.like(id.toString())

            if (response.success) {
                const post = posts.value.find(p => p.id === id)
                if (post) {
                    post.likes += 1
                }
                return { success: true }
            } else {
                return { success: false, error: response.error || 'Failed to like post' }
            }
        } catch (err) {
            return { success: false, error: 'Network error' }
        }
    }

    function addPost(post: Post) {
        posts.value.unshift(post)
    }

    function updatePost(id: number, updates: Partial<Post>) {
        const index = posts.value.findIndex(post => post.id === id)
        if (index !== -1) {
            posts.value[index] = { ...posts.value[index], ...updates }
        }
    }

    function removePost(id: number) {
        const index = posts.value.findIndex(post => post.id === id)
        if (index !== -1) {
            posts.value.splice(index, 1)
        }
    } return {
        posts,
        loading,
        error,
        fetchPosts,
        uploadPost,
        deletePost,
        likePost,
        addPost,
        updatePost,
        removePost
    }
})

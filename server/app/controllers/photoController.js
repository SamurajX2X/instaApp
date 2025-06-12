import { Photo } from '../model.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PHOTOS_FILE_PATH = path.join(__dirname, '../data/photos.json')

let photos = []

const loadPhotos = () => {
    try {
        if (fs.existsSync(PHOTOS_FILE_PATH)) {
            const jsonData = fs.readFileSync(PHOTOS_FILE_PATH, 'utf-8')
            photos = JSON.parse(jsonData).map(p => {
                let photo = new Photo(p.id, p.album, p.originalName, p.url)
                photo.lastChange = p.lastChange
                photo.history = p.history
                photo.tags = p.tags || []
                return photo
            })
        }
    } catch (error) {
        photos = []
    }
}

loadPhotos()

const controller = {
    getall: async () => {
        return photos
    },

    getOne: async (id) => {
        const photoId = parseInt(id)
        const photo = photos.find(p => p.id === photoId)
        if (!photo) {
            return { error: 'Photo not found' }
        }
        return photo
    },

    add: async (photoData) => {
        const newId = Date.now()
        const newPhoto = new Photo(newId, photoData.album, photoData.originalName, photoData.url)
        photos.push(newPhoto)
        return newPhoto
    },

    delete: async (id) => {
        const photoId = parseInt(id)
        const index = photos.findIndex(p => p.id === photoId)
        if (index === -1) {
            return { error: 'Photo not found', photoUrl: null }
        }
        const deletedPhoto = photos.splice(index, 1)[0]
        return { message: 'Photo deleted successfully', photoUrl: deletedPhoto.url }
    },

    update: async (data) => {
        const photoId = parseInt(data.id)
        const photo = photos.find(p => p.id === photoId)
        if (!photo) {
            return { error: 'Photo not found' }
        }
        if (data.tags) {
            photo.tags = data.tags
            photo.updateHistory('tags_updated')
        }
        if (data.filter) {
            photo.updateHistory(data.filter)
        }
        return photo
    }
}

export default controller
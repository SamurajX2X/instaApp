import url from 'url'
import getRequestData from './getRequestData.js'
import fileController from './controllers/fileController.js'
import photoController from './controllers/photoController.js'
import userRouter from './userRouter.js'
import tagsRouter from './tagsRouter.js'
import getImageRouter from './getImageRouter.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import tracer from 'tracer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, 'uploads')

const logger = tracer.colorConsole({
    format: "{{timestamp}} <{{title}}> {{message}} (w {{file}}:{{line}})",
    dateformat: "HH:MM:ss.L"
})

const parseUrl = (requestUrl) => {
    const parsedUrl = url.parse(requestUrl, true)
    return {
        path: parsedUrl.pathname,
        params: parsedUrl.query
    }
}

const extractIdFromPath = (path) => {
    const parts = path.split('/')
    return parts.length >= 4 ? parts[3] : null
}

const sendJsonResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
    res.end(JSON.stringify(data))
}

const router = async (req, res) => {
    const { path, params } = parseUrl(req.url)
    logger.info(`${req.method} ${path}`)

    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        })
        res.end()
        return
    }

    if (path.startsWith('/api/photos')) {
        if (req.method === 'GET' && path === '/api/photos') {
            try {
                let photos
                if (params.album) {
                    photos = (await photoController.getall()).filter(p => p.album === params.album)
                } else {
                    photos = await photoController.getall()
                }
                sendJsonResponse(res, 200, photos)
            } catch (error) {
                logger.error(error)
                sendJsonResponse(res, 500, { error: 'Server error' })
            }
        }
        else if (req.method === 'GET' && path.match(/^\/api\/photos\/\d+$/)) {
            try {
                const id = extractIdFromPath(path)
                const photo = await photoController.getOne(id)
                if (photo.error) {
                    sendJsonResponse(res, 404, photo)
                } else {
                    sendJsonResponse(res, 200, photo)
                }
            } catch (error) {
                logger.error(error)
                sendJsonResponse(res, 500, { error: 'Server error' })
            }
        }
        else if (req.method === 'POST' && path === '/api/photos') {
            try {
                const photoData = await fileController.saveImage(req)
                const newPhoto = await photoController.add(photoData)
                sendJsonResponse(res, 201, newPhoto)
            } catch (error) {
                logger.error(error)
                sendJsonResponse(res, 400, { error: error.message || 'Bad request' })
            }
        }
        else if (req.method === 'DELETE' && path.match(/^\/api\/photos\/\d+$/)) {
            try {
                const id = extractIdFromPath(path)
                const result = await photoController.delete(id)
                if (result.error) {
                    sendJsonResponse(res, 404, result)
                } else {
                    if (result.photoUrl) {
                        await fileController.deleteImage(result.photoUrl)
                    }
                    sendJsonResponse(res, 200, { message: result.message })
                }
            } catch (error) {
                logger.error(error)
                sendJsonResponse(res, 500, { error: 'Server error' })
            }
        }
        else if (req.method === 'PATCH' && path.match(/^\/api\/photos\/\d+$/)) {
            try {
                const data = await getRequestData(req)
                data.id = extractIdFromPath(path)
                const result = await photoController.update(data)
                if (result.error) {
                    sendJsonResponse(res, 404, result)
                } else {
                    sendJsonResponse(res, 200, result)
                }
            } catch (error) {
                logger.error(error)
                sendJsonResponse(res, 500, { error: 'Server error' })
            }
        }
        else {
            sendJsonResponse(res, 405, { error: 'Method not allowed' })
        }
    }
    else if (path.startsWith('/api/users')) {
        await userRouter(req, res)
    }
    else if (path.startsWith('/api/tags')) {
        await tagsRouter(req, res)
    }
    else if (path.startsWith('/uploads/') || path.startsWith('/api/getimage/')) {
        try {
            let imagePath
            if (path.startsWith('/uploads/')) {
                imagePath = path.join(UPLOADS_DIR, path.replace('/uploads/', ''))
            } else {
                const imageId = path.replace('/api/getimage/', '')
                imagePath = path.join(UPLOADS_DIR, imageId)
            }

            if (fs.existsSync(imagePath)) {
                const ext = path.extname(imagePath).toLowerCase()
                let contentType = 'image/jpeg'
                if (ext === '.png') contentType = 'image/png'
                if (ext === '.gif') contentType = 'image/gif'
                if (ext === '.webp') contentType = 'image/webp'

                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*'
                })
                fs.createReadStream(imagePath).pipe(res)
            } else {
                sendJsonResponse(res, 404, { error: 'Image not found' })
            }
        } catch (error) {
            logger.error('Error serving image:', error)
            sendJsonResponse(res, 500, { error: 'Server error' })
        }
    }
    else {
        sendJsonResponse(res, 404, { error: 'Endpoint not found' })
    }
}

export default router
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Photo } from '../model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DATA_FILE = path.join(__dirname, '../data/photos.json');

const ensureDataDir = async () => {
    try {
        await fs.mkdir(path.dirname(PHOTOS_DATA_FILE), { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
};

const readPhotosData = async () => {
    await ensureDataDir();
    try {
        const data = await fs.readFile(PHOTOS_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return [];
        }
        throw err;
    }
};

const writePhotosData = async (data) => {
    await ensureDataDir();
    await fs.writeFile(PHOTOS_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

const controller = {
    add: async (photoData) => {
        const { id, album, originalName, url } = photoData;
        const newPhoto = new Photo(id, album, originalName, url);
        const photos = await readPhotosData();
        photos.push(newPhoto);
        await writePhotosData(photos);
        return newPhoto;
    },

    delete: async (id) => {
        const photoId = typeof id === 'string' ? parseInt(id) : id;
        const photos = await readPhotosData();
        const photoIndex = photos.findIndex(p => p.id === photoId);

        if (photoIndex === -1) {
            return { message: `photo with id ${id} not found` };
        }

        const photoToDelete = photos[photoIndex];
        photos.splice(photoIndex, 1);
        await writePhotosData(photos);

        return {
            message: `photo with id ${id} deleted`,
            photoUrl: photoToDelete.url
        };
    },

    update: async (updateData) => {
        const { id, status } = updateData;
        const photoId = typeof id === 'string' ? parseInt(id) : id;

        if (!status) {
            return { error: "Brak statusu do aktualizacji" };
        }

        const photos = await readPhotosData();
        const photoIndex = photos.findIndex(p => p.id === photoId);

        if (photoIndex === -1) {
            return { error: `photo with id ${id} not found` };
        }

        photos[photoIndex].lastChange = status;
        photos[photoIndex].history.push({
            status: status,
            lastModifiedDate: Date.now()
        });

        await writePhotosData(photos);
        return photos[photoIndex];
    },

    getall: async () => {
        return await readPhotosData();
    },

    getOne: async (id) => {
        const photoId = typeof id === 'string' ? parseInt(id) : id;
        const photos = await readPhotosData();
        const photo = photos.find(p => p.id === photoId);

        if (!photo) {
            return { error: `photo with id ${id} not found` };
        }

        return photo;
    }
};

export default controller;

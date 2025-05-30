import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { popularTags } from '../model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TAGS_DATA_FILE = path.join(__dirname, 'data/tags.json');
const PHOTOS_DATA_FILE = path.join(__dirname, 'data/photos.json');

const ensureDataDir = async () => {
    try {
        await fs.mkdir(path.dirname(TAGS_DATA_FILE), { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
};

const initializeTags = async () => {
    await ensureDataDir();
    try {
        await fs.access(TAGS_DATA_FILE);
    } catch (err) {
        if (err.code === 'ENOENT') {
            const tags = popularTags.map((tag, index) => ({
                id: index,
                name: tag,
                popularity: Math.floor(Math.random() * 500) + 100
            }));
            await fs.writeFile(TAGS_DATA_FILE, JSON.stringify(tags, null, 2), 'utf8');
            return tags;
        }
        throw err;
    }
    return readTagsData();
};

const readTagsData = async () => {
    await ensureDataDir();
    try {
        const data = await fs.readFile(TAGS_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return await initializeTags();
        }
        throw err;
    }
};

const writeTagsData = async (data) => {
    await ensureDataDir();
    await fs.writeFile(TAGS_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
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
    getRawTags: async () => {
        const tags = await readTagsData();
        return tags.map(tag => tag.name);
    },

    getAllTags: async () => {
        return await readTagsData();
    },

    getOneTag: async (id) => {
        const tagId = typeof id === 'string' ? parseInt(id) : id;
        const tags = await readTagsData();
        const tag = tags.find(t => t.id === tagId);

        if (!tag) {
            return { error: `Tag with id ${id} not found` };
        }

        return tag;
    },

    addTag: async (tagData) => {
        const { name, popularity } = tagData;

        if (!name) {
            return { error: "Name is required" };
        }

        if (!name.startsWith('#')) {
            return { error: "Tag name must start with #" };
        }

        const tags = await readTagsData();

        if (tags.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            return { error: "Tag already exists" };
        }

        const newTag = {
            id: tags.length > 0 ? Math.max(...tags.map(t => t.id)) + 1 : 0,
            name,
            popularity: popularity || 1
        };

        tags.push(newTag);
        await writeTagsData(tags);
        return newTag;
    },

    addTagToPhoto: async (photoId, tagName) => {
        const id = typeof photoId === 'string' ? parseInt(photoId) : photoId;
        const photos = await readPhotosData();
        const photoIndex = photos.findIndex(p => p.id === id);

        if (photoIndex === -1) {
            return { error: `Photo with id ${photoId} not found` };
        }

        if (!tagName.startsWith('#')) {
            tagName = '#' + tagName;
        }

        if (!photos[photoIndex].tags) {
            photos[photoIndex].tags = [];
        }

        if (photos[photoIndex].tags.some(t => t.name.toLowerCase() === tagName.toLowerCase())) {
            return { error: `Tag ${tagName} already exists on this photo` };
        }

        photos[photoIndex].tags.push({
            name: tagName
        });

        await writePhotosData(photos);
        return photos[photoIndex];
    },

    addTagsToPhoto: async (photoId, tags) => {
        const id = typeof photoId === 'string' ? parseInt(photoId) : photoId;
        const photos = await readPhotosData();
        const photoIndex = photos.findIndex(p => p.id === id);

        if (photoIndex === -1) {
            return { error: `Photo with id ${photoId} not found` };
        }

        if (!photos[photoIndex].tags) {
            photos[photoIndex].tags = [];
        }

        const existingTagNames = photos[photoIndex].tags.map(t => t.name.toLowerCase());
        const newTags = tags
            .map(tag => {
                let name = tag.name;
                if (!name.startsWith('#')) {
                    name = '#' + name;
                }
                return { name };
            })
            .filter(tag => !existingTagNames.includes(tag.name.toLowerCase()));

        photos[photoIndex].tags = [...photos[photoIndex].tags, ...newTags];

        await writePhotosData(photos);
        return photos[photoIndex];
    },

    getPhotoTags: async (photoId) => {
        const id = typeof photoId === 'string' ? parseInt(photoId) : photoId;
        const photos = await readPhotosData();
        const photo = photos.find(p => p.id === id);

        if (!photo) {
            return { error: `Photo with id ${photoId} not found` };
        }

        return {
            id: photo.id,
            tags: photo.tags || []
        };
    }
};

initializeTags().catch(console.error);

export default controller;
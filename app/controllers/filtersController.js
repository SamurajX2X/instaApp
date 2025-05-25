import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import tracer from 'tracer';

const logger = tracer.colorConsole({
    format: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})",
    dateformat: "HH:MM:ss.L"
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

import jsonController from './jsonController.js';

const filtersController = {
    getMetadata: async (id) => {
        try {
            const photo = await jsonController.getOne(id);

            if (photo.error) {
                return photo;
            }

            const imagePath = path.join(__dirname, '../..', photo.url);

            return new Promise(async (resolve, reject) => {
                try {
                    if (imagePath) {
                        let meta = await sharp(imagePath).metadata();
                        resolve(meta);
                    } else {
                        resolve("url_not_found");
                    }
                } catch (err) {
                    reject(err.message);
                }
            });
        } catch (error) {
            logger.error('Error getting metadata:', error);
            throw error;
        }
    },

    applyFilter: async (photoData) => {
        try {
            const { id, lastChange, ...filterOptions } = photoData;

            const photo = await jsonController.getOne(id);
            if (photo.error) {
                return photo;
            }

            const imagePath = path.join(__dirname, '../..', photo.url);
            const imageDir = path.dirname(imagePath);
            const imageExt = path.extname(imagePath);
            const baseName = path.basename(imagePath, imageExt);

            const filteredPath = path.join(imageDir, `${baseName}-${lastChange}${imageExt}`);
            const relativeFilteredPath = path.relative(path.join(__dirname, '../..'), filteredPath).replace(/\\/g, '/');

            let imageProcessor = sharp(imagePath);

            switch (lastChange) {
                case 'rotate':
                    imageProcessor = imageProcessor.rotate(filterOptions.angle || 90);
                    break;
                case 'resize':
                    imageProcessor = imageProcessor.resize({
                        width: filterOptions.width,
                        height: filterOptions.height
                    });
                    break;
                case 'crop':
                    imageProcessor = imageProcessor.extract({
                        width: filterOptions.width,
                        height: filterOptions.height,
                        left: filterOptions.left || 0,
                        top: filterOptions.top || 0
                    });
                    break;
                case 'grayscale':
                    imageProcessor = imageProcessor.grayscale();
                    break;
                case 'flip':
                    imageProcessor = imageProcessor.flip();
                    break;
                case 'flop':
                    imageProcessor = imageProcessor.flop();
                    break;
                case 'negate':
                    imageProcessor = imageProcessor.negate();
                    break;
                case 'tint':
                    imageProcessor = imageProcessor.tint({
                        r: filterOptions.r || 255,
                        g: filterOptions.g || 0,
                        b: filterOptions.b || 0
                    });
                    break;
                case 'reformat':
                    const newExt = filterOptions.format || 'png';
                    const newFilteredPath = path.join(imageDir, `${baseName}-${lastChange}.${newExt}`);
                    imageProcessor = imageProcessor.toFormat(newExt);
                    break;
                default:
                    return { error: "Unknown filter type" };
            }

            await imageProcessor.toFile(filteredPath);

            const timestamp = Date.now();

            const historyEntry = {
                status: lastChange,
                timestamp: timestamp,
                url: relativeFilteredPath
            };

            const updatedPhoto = {
                ...photo,
                lastChange,
                history: [...photo.history, historyEntry]
            };

            await jsonController.update(updatedPhoto);

            return updatedPhoto;
        } catch (error) {
            logger.error('Error applying filter:', error);
            throw error;
        }
    },

    getImage: async (id, filterName = null) => {
        try {
            const photo = await jsonController.getOne(id);

            if (photo.error) {
                return photo;
            }

            let imagePathToRead;

            if (filterName) {
                const filteredEntry = photo.history.find(entry => entry.status === filterName);

                if (!filteredEntry || !filteredEntry.url) {
                    return { error: "Filtered image not found" };
                }

                imagePathToRead = path.join(__dirname, '../..', filteredEntry.url);
            } else {
                imagePathToRead = path.join(__dirname, '../..', photo.url);
            }

            return new Promise((resolve, reject) => {
                fs.readFile(imagePathToRead, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            data,
                            contentType: `image/${path.extname(imagePathToRead).substring(1)}`
                        });
                    }
                });
            });
        } catch (error) {
            logger.error('Error getting image:', error);
            throw error;
        }
    }
};

export default filtersController;

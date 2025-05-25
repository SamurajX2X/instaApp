import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import formidable from 'formidable';
import userController from './userController.js';
import tracer from 'tracer';

const logger = tracer.colorConsole({
    format: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})",
    dateformat: "HH:MM:ss.L"
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_DIR = path.join(__dirname, '../../profile');

const ensureProfileDir = async (email) => {
    const userProfileDir = path.join(PROFILE_DIR, email);
    try {
        await fs.promises.mkdir(userProfileDir, { recursive: true });
        return userProfileDir;
    } catch (error) {
        logger.error('Error creating profile directory:', error);
        throw error;
    }
};

const blacklistedTokens = new Set();

const profileController = {
    verifyTokenAndGetUser: async (authHeader) => {
        try {
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error('Authorization header is missing or invalid');
            }

            const token = authHeader.split(' ')[1];

            if (blacklistedTokens.has(token)) {
                throw new Error('Token has been revoked');
            }

            const decoded = userController.verifyToken(token);
            const users = await userController.getAllUsers();
            const user = users.find(u => u.email === decoded.email);

            if (!user) {
                throw new Error('User not found');
            }

            return { user, token };
        } catch (error) {
            throw error;
        }
    },

    getProfile: async (authHeader) => {
        try {
            const { user } = await profileController.verifyTokenAndGetUser(authHeader);
            return user;
        } catch (error) {
            logger.error('Error getting profile:', error);
            throw error;
        }
    },

    updateProfile: async (authHeader, updateData) => {
        try {
            const { user } = await profileController.verifyTokenAndGetUser(authHeader);

            const { email, password, id, ...safeUpdateData } = updateData;

            const updatedUser = await userController.updateUser(user.id, safeUpdateData);
            return updatedUser;
        } catch (error) {
            logger.error('Error updating profile:', error);
            throw error;
        }
    },

    uploadProfilePhoto: async (authHeader, req) => {
        try {
            const { user } = await profileController.verifyTokenAndGetUser(authHeader);

            const form = formidable({
                uploadDir: path.join(__dirname, '../../temp'),
                keepExtensions: true,
                maxFileSize: 10 * 1024 * 1024
            });

            return new Promise((resolve, reject) => {
                form.parse(req, async (err, fields, files) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const file = files.file;
                    if (!file || !file[0]) {
                        reject(new Error('No file uploaded'));
                        return;
                    }

                    try {
                        const userProfileDir = await ensureProfileDir(user.email);
                        const inputPath = file[0].filepath;

                        const profileImages = await profileController.processProfileImages(
                            inputPath,
                            userProfileDir,
                            user.email
                        );

                        const updatedUser = await userController.updateUser(user.id, {
                            profileArray: profileImages
                        });

                        await fs.promises.unlink(inputPath);

                        resolve(updatedUser);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            logger.error('Error uploading profile photo:', error);
            throw error;
        }
    },

    processProfileImages: async (inputPath, outputDir, email) => {
        try {
            const baseUrl = `http://localhost:3000/api/getimage/profile/${email}`;
            const images = [];

            const metadata = await sharp(inputPath).metadata();
            const { width, height } = metadata;
            const squareSize = Math.min(width, height);
            const left = Math.floor((width - squareSize) / 2);
            const top = Math.floor((height - squareSize) / 2);

            const originalPath = path.join(outputDir, 'profile.png');
            await sharp(inputPath)
                .toFormat('png')
                .toFile(originalPath);
            images.push({
                name: 'profile.png',
                http: `${baseUrl}/profile.png`
            });

            const squarePath = path.join(outputDir, 'profile-cropped-square.png');
            await sharp(inputPath)
                .extract({ left, top, width: squareSize, height: squareSize })
                .toFile(squarePath);
            images.push({
                name: 'profile-cropped-square.png',
                http: `${baseUrl}/profile-cropped-square.png`
            });

            const roundedCorners = Buffer.from(
                `<svg><rect x="0" y="0" width="${squareSize}" height="${squareSize}" rx="${squareSize / 2}" ry="${squareSize / 2}"/></svg>`
            );

            const roundedPath = path.join(outputDir, 'profile-cropped-rounded.png');
            await sharp(inputPath)
                .extract({ left, top, width: squareSize, height: squareSize })
                .composite([{
                    input: roundedCorners,
                    blend: 'dest-in'
                }])
                .toFile(roundedPath);
            images.push({
                name: 'profile-cropped-rounded.png',
                http: `${baseUrl}/profile-cropped-rounded.png`
            });

            const fontSize = Math.floor(squareSize * 0.7);
            const letterSvgBuffer = Buffer.from(
                `<svg width="${squareSize}" height="${squareSize}" viewBox="0 0 ${squareSize} ${squareSize}">
                  <rect x="0" y="0" width="100%" height="100%" fill="rgba(255,0,0,0.5)"/>   
                  <text
                        x="50%" y="50%"
                        alignment-baseline="middle"
                        text-anchor="middle"
                        font-family="Arial, sans-serif"
                        font-size="${fontSize}"
                        fill="yellow"
                        >OK</text>
                </svg>`
            );

            const lettersPath = path.join(outputDir, 'profile-cropped-rounded-with-letters.png');
            await sharp(inputPath)
                .extract({ left, top, width: squareSize, height: squareSize })
                .composite([
                    { input: roundedCorners, blend: 'dest-in' },
                    { input: letterSvgBuffer, blend: 'over' }
                ])
                .toFile(lettersPath);
            images.push({
                name: 'profile-cropped-rounded-with-letters.png',
                http: `${baseUrl}/profile-cropped-rounded-with-letters.png`
            });

            const borderRadius = squareSize / 2 - 5;
            const borderSvgBuffer = Buffer.from(
                `<svg width="${squareSize}" height="${squareSize}">
                    <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0)"/>
                    <circle cx="${squareSize / 2}" cy="${squareSize / 2}" r="${borderRadius}" fill="none" stroke="yellow" stroke-width="10"/>
                </svg>`
            );

            const borderPath = path.join(outputDir, 'profile-cropped-rounded-with-border.png');
            await sharp(inputPath)
                .extract({ left, top, width: squareSize, height: squareSize })
                .composite([
                    { input: roundedCorners, blend: 'dest-in' },
                    { input: borderSvgBuffer, blend: 'over' }
                ])
                .toFile(borderPath);
            images.push({
                name: 'profile-cropped-rounded-with-border.png',
                http: `${baseUrl}/profile-cropped-rounded-with-border.png`
            });

            const gradientSvg = Buffer.from(
                `<svg width="${squareSize}" height="${squareSize}" >
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stop-color="#f00"/>
                        <stop offset="100%" stop-color="#00f"/>
                      </linearGradient>
                    </defs>
                    <circle cx="${squareSize / 2}" cy="${squareSize / 2}" r="${borderRadius}" fill="none" stroke="url(#gradient)" stroke-width="10"/>
                </svg>`
            );

            const gradientPath = path.join(outputDir, 'profile-cropped-rounded-with-gradient.png');
            await sharp(inputPath)
                .extract({ left, top, width: squareSize, height: squareSize })
                .composite([
                    { input: roundedCorners, blend: 'dest-in' },
                    { input: gradientSvg, blend: 'over' }
                ])
                .toFile(gradientPath);
            images.push({
                name: 'profile-cropped-rounded-with-gradient.png',
                http: `${baseUrl}/profile-cropped-rounded-with-gradient.png`
            });

            const patternSvg = Buffer.from(
                `<svg width="${squareSize}" height="${squareSize}" >
                    <defs>
                    <pattern id="stripes" width="10" height="20" patternUnits="userSpaceOnUse">
                        <rect width="10" height="10" fill="white" />
                        <rect y="10" width="10" height="10" fill="black" />
                    </pattern>
                    </defs>
                    <rect x="0" y="0" width="${squareSize}" height="${squareSize}" fill="url(#stripes)" />
                </svg>`
            );

            const patternPath = path.join(outputDir, 'profile-cropped-rounded-with-pattern.png');
            await sharp(inputPath)
                .extract({ left, top, width: squareSize, height: squareSize })
                .composite([
                    { input: roundedCorners, blend: 'dest-in' },
                    { input: patternSvg, blend: 'overlay' }
                ])
                .toFile(patternPath);
            images.push({
                name: 'profile-cropped-rounded-with-pattern.png',
                http: `${baseUrl}/profile-cropped-rounded-with-pattern.png`
            });

            return images;
        } catch (error) {
            logger.error('Error processing profile images:', error);
            throw error;
        }
    },

    logout: async (authHeader) => {
        try {
            const { token } = await profileController.verifyTokenAndGetUser(authHeader);
            blacklistedTokens.add(token);
            return { message: 'Logged out successfully' };
        } catch (error) {
            logger.error('Error logging out:', error);
            throw error;
        }
    }
};

export default profileController;

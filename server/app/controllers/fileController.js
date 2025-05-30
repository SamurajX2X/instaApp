import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IncomingForm } from 'formidable';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const controller = {
    saveImage: (req) => {
        return new Promise((resolve, reject) => {

            const form = new IncomingForm();

            form.parse(req, (err, fields, files) => {
                if (err) {
                    return reject(err);
                }

                if (!fields.album || !Array.isArray(fields.album) || fields.album.length === 0) {
                    return reject(new Error("Brak nazwy albumu"));
                }
                const album = fields.album[0];

                if (!files.file || !Array.isArray(files.file) || files.file.length === 0) {
                    return reject(new Error("Brak pliku"));
                }
                const file = files.file[0];

                const albumDir = path.join(UPLOAD_DIR, album);
                if (!fs.existsSync(albumDir)) {
                    fs.mkdirSync(albumDir, { recursive: true });
                }

                const timestamp = Date.now();
                const fileExt = path.extname(file.originalFilename);
                const newFileName = `upload_${timestamp}${fileExt}`;
                const newFilePath = path.join(albumDir, newFileName);

                fs.copyFile(file.filepath, newFilePath, (err) => {
                    if (err) {
                        return reject(err);
                    }

                    fs.unlink(file.filepath, () => {
                        resolve({
                            album,
                            originalName: file.originalFilename,
                            url: path.join('uploads', album, newFileName).replace(/\\/g, '\\\\'),
                            id: Date.now()
                        });
                    });
                });
            });
        });
    },

    deleteImage: (filePath) => {
        return new Promise((resolve, reject) => {
            fs.access(path.join(__dirname, '..', filePath), fs.constants.F_OK, (err) => {
                if (err) {
                    console.log(`Plik ${filePath} nie istnieje`);
                    return resolve();
                }

                fs.unlink(path.join(__dirname, '..', filePath), (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
    }
};

export default controller;

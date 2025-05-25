import url from 'url';
import filtersController from './controllers/filtersController.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import tracer from 'tracer';

const logger = tracer.colorConsole({
    format: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})",
    dateformat: "HH:MM:ss.L"
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_DIR = path.join(__dirname, '../profile');

const parseUrl = (requestUrl) => {
    const parsedUrl = url.parse(requestUrl, true);
    return {
        path: parsedUrl.pathname,
        params: parsedUrl.query
    };
};

const getImageRouter = async (req, res) => {
    const { path } = parseUrl(req.url);
    logger.info(`Received ${req.method} request for ${path}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const pathParts = path.split('/');

            if (pathParts.length === 4 && pathParts[2].match(/^\d+$/)) {
                const id = pathParts[2];
                const imageResult = await filtersController.getImage(id);

                if (imageResult.error) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(imageResult));
                } else {
                    res.writeHead(200, { 'Content-Type': imageResult.contentType });
                    res.end(imageResult.data);
                }
            }
            else if (pathParts.length === 6 && pathParts[2].match(/^\d+$/) && pathParts[3] === 'filter') {
                const id = pathParts[2];
                const filterName = pathParts[4];
                const imageResult = await filtersController.getImage(id, filterName);

                if (imageResult.error) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(imageResult));
                } else {
                    res.writeHead(200, { 'Content-Type': imageResult.contentType });
                    res.end(imageResult.data);
                }
            } else if (pathParts.length >= 5 && pathParts[2] === 'profile') {
                const userEmail = pathParts[3];
                const fileName = pathParts.slice(4).join('/');
                const filePath = path.join(PROFILE_DIR, userEmail, fileName);

                try {
                    if (!fs.existsSync(filePath)) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Profile image not found' }));
                        return;
                    }

                    const data = fs.readFileSync(filePath);
                    const ext = path.extname(filePath).toLowerCase();
                    let contentType = 'image/jpeg';

                    if (ext === '.png') {
                        contentType = 'image/png';
                    } else if (ext === '.gif') {
                        contentType = 'image/gif';
                    } else if (ext === '.webp') {
                        contentType = 'image/webp';
                    }

                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data);
                } catch (error) {
                    logger.error('Error serving profile image:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error serving profile image' }));
                }
            }
            else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Endpoint not found' }));
            }
        }
        else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
    } catch (error) {
        logger.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
};

export default getImageRouter;

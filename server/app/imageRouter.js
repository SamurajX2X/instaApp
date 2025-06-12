import url from 'url';
import getRequestData from './getRequestData.js';
import fileController from './controllers/fileController.js';
import jsonController from './controllers/jsonController.js';
import tagsController from './controllers/tagsController.js';
import tracer from 'tracer';

const logger = tracer.colorConsole({
    format: "{{timestamp}} <{{title}}> {{message}} (w {{file}}:{{line}})",
    dateformat: "HH:MM:ss.L"
});

const parseUrl = (requestUrl) => {
    const parsedUrl = url.parse(requestUrl, true);
    return {
        path: parsedUrl.pathname,
        params: parsedUrl.query
    };
};

const extractIdFromPath = (path) => {
    const parts = path.split('/');
    return parts.length >= 4 ? parts[3] : null;
};

const sendJsonResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const router = async (req, res) => {
    const { path } = parseUrl(req.url);
    // logger.info(`Otrzymano ${req.method} zapytanie dla ${path}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    if (path.startsWith('/api/photos')) {

        if (req.method === 'GET' && path === '/api/photos') {
            try {
                const photos = await jsonController.getall();
                sendJsonResponse(res, 200, photos);
            } catch (error) {
                logger.error(error);
                sendJsonResponse(res, 500, { error: 'Blad serwera' });
            }
        }
        // jedno zdj
        else if (req.method === 'GET' && path.match(/^\/api\/photos\/\d+$/)) {
            try {
                const id = extractIdFromPath(path);
                const photo = await jsonController.getOne(id);

                if (photo.error) {
                    sendJsonResponse(res, 404, photo);
                } else {
                    sendJsonResponse(res, 200, photo);
                }
            } catch (error) {
                logger.error(error);
                sendJsonResponse(res, 500, { error: 'Blad serwera' });
            }
        }
        // tagi zdj
        else if (req.method === 'GET' && path.match(/^\/api\/photos\/tags\/\d+$/)) {
            try {
                const id = path.split('/').pop();
                const result = await tagsController.getPhotoTags(id);

                if (result.error) {
                    sendJsonResponse(res, 404, result);
                } else {
                    sendJsonResponse(res, 200, result);
                }
            } catch (error) {
                logger.error(error);
                sendJsonResponse(res, 500, { error: 'Blad serwera' });
            }
        }
        // nowe zdj
        else if (req.method === 'POST' && path === '/api/photos') {
            try {
                const photoData = await fileController.saveImage(req);
                const newPhoto = await jsonController.add(photoData);
                sendJsonResponse(res, 201, newPhoto);
            } catch (error) {
                logger.error(error);
                sendJsonResponse(res, 400, { error: error.message || 'Bledne zapytanie' });
            }
        }
        // delete 
        else if (req.method === 'DELETE' && path.match(/^\/api\/photos\/\d+$/)) {
            try {
                const id = extractIdFromPath(path);
                const result = await jsonController.delete(id);

                if (result.message.includes('not found')) {
                    sendJsonResponse(res, 404, result);
                } else {
                    await fileController.deleteImage(result.photoUrl);
                    sendJsonResponse(res, 200, { message: result.message });
                }
            } catch (error) {
                logger.error(error);
                sendJsonResponse(res, 500, { error: 'Blad serwera' });
            }
        }
        // update statusu zdj 
        else if (req.method === 'PATCH' && path === '/api/photos') {
            try {
                const data = await getRequestData(req);
                const result = await jsonController.update(data);

                if (result.error) {
                    sendJsonResponse(res, 404, result);
                } else {
                    sendJsonResponse(res, 200, result);
                }
            } catch (error) {
                logger.error(error);
                sendJsonResponse(res, 500, { error: 'Blad serwera' });
            }
        }
        // dodanie tagu
        else if (req.method === 'PATCH' && path === '/api/photos/tags') {
            try {
                const data = await getRequestData(req);

                if (!data.id) {
                    sendJsonResponse(res, 400, { error: 'Missing photo ID' });
                    return;
                }

                if (!data.name) {
                    sendJsonResponse(res, 400, { error: 'Missing tag name' });
                    return;
                }

                const result = await tagsController.addTagToPhoto(data.id, data.name);

                if (result.error) {
                    sendJsonResponse(res, 404, result);
                } else {
                    sendJsonResponse(res, 200, result);
                }
            } catch (error) {
                logger.error(error);
                sendJsonResponse(res, 500, { error: 'Blad serwera' });
            }
        }
        // dodanie kilku tagow
        else if (req.method === 'PATCH' && path === '/api/photos/tags/mass') {
            try {
                const data = await getRequestData(req);

                if (!data.id) {
                    sendJsonResponse(res, 400, { error: 'Missing photo ID' });
                    return;
                }

                if (!data.tags || !Array.isArray(data.tags)) {
                    sendJsonResponse(res, 400, { error: 'Tags must be an array' });
                    return;
                }

                const result = await tagsController.addTagsToPhoto(data.id, data.tags);

                if (result.error) {
                    sendJsonResponse(res, 404, result);
                } else {
                    sendJsonResponse(res, 200, result);
                }
            } catch (error) {
                logger.error(error);
                sendJsonResponse(res, 500, { error: 'Blad serwera' });
            }
        }

    }
    else {
        sendJsonResponse(res, 404, { error: 'Endpoint nie znaleziony' });
    }
};

export default router;
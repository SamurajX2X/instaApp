import url from 'url';
import tagsController from './controllers/tagsController.js';
import getRequestData from './getRequestData.js';
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

const sendJsonResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const router = async (req, res) => {
    const { path } = parseUrl(req.url);
    logger.info(`Otrzymano ${req.method} zapytanie dla ${path}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }


    if (req.method === 'GET' && path === '/api/tags/raw') {
        try {
            const tags = await tagsController.getRawTags();
            sendJsonResponse(res, 200, tags);
        } catch (error) {
            logger.error(error);
            sendJsonResponse(res, 500, { error: 'Błąd serwera' });
        }
    }

    else if (req.method === 'GET' && path === '/api/tags') {
        try {
            const tags = await tagsController.getAllTags();
            sendJsonResponse(res, 200, tags);
        } catch (error) {
            logger.error(error);
            sendJsonResponse(res, 500, { error: 'Błąd serwera' });
        }
    }

    else if (req.method === 'GET' && path.match(/^\/api\/tags\/\d+$/)) {
        try {
            const id = path.split('/').pop();
            const tag = await tagsController.getOneTag(id);

            if (tag.error) {
                sendJsonResponse(res, 404, tag);
            } else {
                sendJsonResponse(res, 200, tag);
            }
        } catch (error) {
            logger.error(error);
            sendJsonResponse(res, 500, { error: 'Błąd serwera' });
        }
    }

    else if (req.method === 'POST' && path === '/api/tags') {
        try {
            const data = await getRequestData(req);
            const newTag = await tagsController.addTag(data);

            if (newTag.error) {
                sendJsonResponse(res, 400, newTag);
            } else {
                sendJsonResponse(res, 201, newTag);
            }
        } catch (error) {
            logger.error(error);
            sendJsonResponse(res, 500, { error: 'Błąd serwera' });
        }
    }

    else {
        sendJsonResponse(res, 404, { error: 'Endpoint nie znaleziony' });
    }
};

export default router;
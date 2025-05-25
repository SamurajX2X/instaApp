import url from 'url';
import getRequestData from '../getRequestData.js';
import filtersController from '../controllers/filtersController.js';
import tracer from 'tracer';

const logger = tracer.colorConsole({
    format: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})",
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
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
};

const filtersRouter = async (req, res) => {
    const { path } = parseUrl(req.url);
    logger.info(`Received ${req.method} request for ${path}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    try {
        if (req.method === 'GET' && path.match(/^\/api\/filters\/metadata\/\d+$/)) {
            const id = extractIdFromPath(path);
            const metadata = await filtersController.getMetadata(id);

            if (metadata.error) {
                sendJsonResponse(res, 404, metadata);
            } else {
                sendJsonResponse(res, 200, metadata);
            }
        }
        else if (req.method === 'PATCH' && path === '/api/filters') {
            const filterData = await getRequestData(req);
            const result = await filtersController.applyFilter(JSON.parse(filterData));

            if (result.error) {
                sendJsonResponse(res, 404, result);
            } else {
                sendJsonResponse(res, 200, result);
            }
        }
        else {
            sendJsonResponse(res, 404, { error: 'Endpoint not found' });
        }
    } catch (error) {
        logger.error(error);
        sendJsonResponse(res, 500, { error: 'Server error' });
    }
};

export default filtersRouter;

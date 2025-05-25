import url from 'url';
import getRequestData from './getRequestData.js';
import profileController from './controllers/profileController.js';
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

const sendJsonResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
};

const profileRouter = async (req, res) => {
    const { path } = parseUrl(req.url);
    logger.info(`Received ${req.method} request for ${path}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    try {
        const authHeader = req.headers.authorization;

        if (req.method === 'GET' && path === '/api/profile') {
            const profile = await profileController.getProfile(authHeader);
            sendJsonResponse(res, 200, profile);
        }
        else if (req.method === 'PATCH' && path === '/api/profile') {
            const updateData = await getRequestData(req);
            const updatedProfile = await profileController.updateProfile(authHeader, JSON.parse(updateData));
            sendJsonResponse(res, 200, updatedProfile);
        }
        else if (req.method === 'POST' && path === '/api/profile') {
            const updatedProfile = await profileController.uploadProfilePhoto(authHeader, req);
            sendJsonResponse(res, 200, updatedProfile);
        }
        else if (req.method === 'GET' && path === '/api/profile/logout') {
            const result = await profileController.logout(authHeader);
            sendJsonResponse(res, 200, result);
        }
        else {
            sendJsonResponse(res, 404, { error: 'Endpoint not found' });
        }
    } catch (error) {
        logger.error('Error in profileRouter:', error);

        if (error.message.includes('Authorization') || error.message.includes('Token') || error.message.includes('Unauthorized')) {
            sendJsonResponse(res, 401, { error: error.message });
        } else if (error.message.includes('not found')) {
            sendJsonResponse(res, 404, { error: error.message });
        } else {
            sendJsonResponse(res, 500, { error: 'Internal Server Error' });
        }
    }
};

export default profileRouter;

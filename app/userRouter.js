import url from 'url';
import getRequestData from './getRequestData.js';
import userController from './controllers/userController.js';
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }); res.end(JSON.stringify(data));
};

const authenticate = async (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Authorization header is missing or invalid');
        }

        const token = authHeader.split(' ')[1];
        return userController.verifyToken(token);
    } catch (error) {
        throw error;
    }
};

const userRouter = async (req, res) => {
    const { path } = parseUrl(req.url);
    logger.info(`Received ${req.method} request for ${path}`);

    try {
        // Preflight żądania CORS
        if (req.method === 'OPTIONS') {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end();
            return;
        }        // Publiczne ścieżki (bez wymaganego uwierzytelniania)
        if (path === '/api/users/register' && req.method === 'POST') {
            const userData = await getRequestData(req);
            const newUser = await userController.registerUser(userData);
            sendJsonResponse(res, 201, newUser);
            return;
        }

        if (path === '/api/users/login' && req.method === 'POST') {
            const loginData = await getRequestData(req);
            const result = await userController.loginUser(loginData);
            sendJsonResponse(res, 200, result);
            return;
        }        // Chronione ścieżki (wymagane uwierzytelnianie)
        try {
            // Weryfikacja tokenu dla chronionych ścieżek
            const decoded = await authenticate(req);
            req.user = decoded;

            // Pobierz wszystkich użytkowników - ścieżka administratora
            if (path === '/api/users' && req.method === 'GET') {
                const users = await userController.getAllUsers();
                sendJsonResponse(res, 200, users);
                return;
            }

            // Pobierz użytkownika po ID
            if (path.match(/^\/api\/users\/[^/]+$/) && req.method === 'GET') {
                const id = extractIdFromPath(path);

                // Pozwól użytkownikom dostęp tylko do własnego profilu
                if (id !== req.user.userId) {
                    sendJsonResponse(res, 403, { error: 'Forbidden: You can only access your own profile' });
                    return;
                }

                const user = await userController.getUserById(id);
                sendJsonResponse(res, 200, user);
                return;
            }

            // Aktualizuj użytkownika
            if (path.match(/^\/api\/users\/[^/]+$/) && req.method === 'PUT') {
                const id = extractIdFromPath(path);

                // Pozwól użytkownikom aktualizować tylko własny profil
                if (id !== req.user.userId) {
                    sendJsonResponse(res, 403, { error: 'Forbidden: You can only update your own profile' });
                    return;
                }
                const updateData = await getRequestData(req);
                const updatedUser = await userController.updateUser(id, updateData);
                sendJsonResponse(res, 200, updatedUser);
                return;
            }

            // Zmień hasło
            if (path.match(/^\/api\/users\/[^/]+\/password$/) && req.method === 'PUT') {
                const id = path.split('/')[3];

                // Pozwól użytkownikom zmieniać tylko własne hasło
                if (id !== req.user.userId) {
                    sendJsonResponse(res, 403, { error: 'Forbidden: You can only change your own password' });
                    return;
                }
                const passwordData = await getRequestData(req);
                const result = await userController.changePassword(id, passwordData);
                sendJsonResponse(res, 200, result);
                return;
            }

            // Usuń użytkownika
            if (path.match(/^\/api\/users\/[^/]+$/) && req.method === 'DELETE') {
                const id = extractIdFromPath(path);

                // Pozwól użytkownikom usuwać tylko własne konto
                if (id !== req.user.userId) {
                    sendJsonResponse(res, 403, { error: 'Forbidden: You can only delete your own account' });
                    return;
                }

                const result = await userController.deleteUser(id);
                sendJsonResponse(res, 200, result);
                return;
            }

            // Ścieżka nie znaleziona
            sendJsonResponse(res, 404, { error: 'Endpoint not found' });

        } catch (authError) {
            logger.error('Authentication error:', authError);
            sendJsonResponse(res, 401, { error: 'Unauthorized: ' + authError.message });
            return;
        }

    } catch (error) {
        logger.error('Error in userRouter:', error);

        if (error.message.includes('not found') || error.message.includes('missing')) {
            sendJsonResponse(res, 400, { error: error.message });
        } else if (error.message.includes('exists')) {
            sendJsonResponse(res, 409, { error: error.message });
        } else if (error.message.includes('Invalid credentials')) {
            sendJsonResponse(res, 401, { error: error.message });
        } else {
            sendJsonResponse(res, 500, { error: 'Internal Server Error' });
        }
    }
};

export default userRouter;

import { createServer } from 'http';
import router from "./app/router.js";
import imageRouter from "./app/imageRouter.js";
import tagsRouter from "./app/tagsRouter.js";
import filtersRouter from "./app/filtersRouter.js";
import getImageRouter from "./app/getImageRouter.js";
import profileRouter from "./app/profileRouter.js";
import 'dotenv/config.js'

const PORT = process.env.APP_PORT;

createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        if (req.url.startsWith('/api/photos')) {
            await imageRouter(req, res);
        }
        else if (req.url.startsWith('/api/tags')) {
            await tagsRouter(req, res);
        }
        else if (req.url.startsWith('/api/filters')) {
            await filtersRouter(req, res);
        } else if (req.url.startsWith('/api/getimage')) {
            await getImageRouter(req, res);
        }
        else if (req.url.startsWith('/api/profile')) {
            await profileRouter(req, res);
        }
        else if (req.url.startsWith('/api')) {
            await router(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Endpoint nie znaleziony' }));
        }
    } catch (error) {
        console.error("Server error:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
})
    .listen(PORT, () => console.log("listen on " + PORT));
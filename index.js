import { createServer } from 'http';
import imageRouter from "./app/imageRouter.js";
import tagsRouter from "./app/tagsRouter.js";

const PORT = 3000;

createServer(async (req, res) => {
    //images
    if (req.url.search("/api/photos") != -1) {
        await imageRouter(req, res);
    }
    //tags
    else if (req.url.search("/api/tags") != -1) {
        await tagsRouter(req, res);
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint nie znaleziony' }));
    }
})
    .listen(PORT, () => console.log("listen on " + PORT));
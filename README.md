# InstaApp

A Node.js REST API for managing photos, albums, and tags similar to Instagram.

## Project Overview

InstaApp is a server application that provides REST API endpoints for:
- Uploading and managing photos
- Organizing photos into albums
- Adding and managing tags for photos

## Features

### Photo Management
- Upload photos with album information
- Get all photos or a specific photo by ID
- Update photo status/history
- Delete photos

### Tag Management
- Get all available tags (raw format or as objects)
- Get a specific tag by ID
- Create new tags
- Add tags to photos (single tag or multiple tags)
- Get all tags for a specific photo

## Project Structure

```
├── index.js                 # Application entry point
├── package.json             # Project dependencies
├── tags.rest                # Tag API testing file
├── test.rest                # Photo API testing file
├── app/
│   ├── getRequestData.js    # Helper for parsing request body
│   ├── imageRouter.js       # Router for photo endpoints
│   ├── model.js             # Data models
│   ├── tagsRouter.js        # Router for tag endpoints
│   ├── controllers/
│   │   ├── fileController.js    # File operations controller
│   │   ├── jsonController.js    # Data operations controller
│   │   ├── tagsController.js    # Tag operations controller
│   ├── data/                # JSON data storage
│   │   ├── photos.json      # Photo metadata
│   │   ├── tags.json        # Tag metadata
│   ├── uploads/             # Photo upload directory
│       ├── [album_name]/    # Album directories
```

## API Endpoints

### Photos API (`/api/photos`)

- `GET /api/photos` - Get all photos
- `GET /api/photos/:id` - Get a specific photo by ID
- `POST /api/photos` - Upload a new photo
- `PATCH /api/photos` - Update photo status/history
- `DELETE /api/photos/:id` - Delete a photo
- `GET /api/photos/tags/:id` - Get tags for a specific photo
- `PATCH /api/photos/tags` - Add a tag to a photo
- `PATCH /api/photos/tags/mass` - Add multiple tags to a photo

### Tags API (`/api/tags`)

- `GET /api/tags/raw` - Get all tags in raw format
- `GET /api/tags` - Get all tags as objects with popularity info
- `GET /api/tags/:id` - Get a specific tag by ID
- `POST /api/tags` - Create a new tag

## Installation & Setup

1. Clone this repository:
```bash
git clone https://github.com/SamurajX2X/instaApp.git
cd instaApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node index.js
```

The server will start on port 3000 by default.

## Testing the API

You can use the included `.rest` files to test the API if you have the REST Client extension installed in VS Code:

- `test.rest` - Tests for photo endpoints
- `tags.rest` - Tests for tag endpoints

Alternatively, you can use tools like Postman or curl to make requests to the API.

### Example: Uploading a Photo

```http
POST http://localhost:3000/api/photos HTTP/1.1
Content-Type: multipart/form-data; boundary=----FormBoundary1234

------FormBoundary1234
Content-Disposition: form-data; name="file"; filename="image.jpg"
Content-Type: image/jpeg

< ./image.jpg
------FormBoundary1234
Content-Disposition: form-data; name="album"

album_name
------FormBoundary1234--
```

### Example: Adding Tags to a Photo

```http
PATCH http://localhost:3000/api/photos/tags/mass HTTP/1.1
Content-Type: application/json

{
  "id": 1711195846479,
  "tags": [
    {"name": "#sunset"},
    {"name": "#beautiful"},
    {"name": "#nature"}
  ]
}
```

## Dependencies

- Node.js
- formidable (for file uploads)
- tracer (for logging)

## License

This project is for educational purposes and is not licensed for commercial use.

## Author

Developed by SamurajX2X
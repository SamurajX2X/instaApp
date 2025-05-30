# InstaApp

A full-stack Instagram-like application with Node.js backend and Svelte frontend.

## Project Overview

InstaApp is a monorepo containing:
- **Server**: Node.js REST API for managing photos, albums, and tags
- **Client**: Svelte frontend application with modern UI
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
├── server/                  # Node.js backend
│   ├── index.js             # Server entry point
│   ├── package.json         # Server dependencies
│   ├── app/                 # Application logic
│   │   ├── controllers/     # Business logic controllers
│   │   ├── data/           # JSON data storage
│   │   └── uploads/        # Photo upload directory
│   └── *.rest              # API testing files
├── client/                  # Svelte frontend
│   ├── src/                # Source code
│   ├── static/             # Static assets
│   └── package.json        # Client dependencies
├── profile/                # User profiles (to be organized)
└── package.json            # Monorepo configuration
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Install all dependencies:
```bash
npm run install:all
```
`w`

2. Set up environment variables:
Create a `.env` file in the `server/` directory with:
```
APP_PORT=3001
JWT_SECRET=your_jwt_secret_here
```

### Development

Run both server and client in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
# Server only
npm run dev:server

# Client only  
npm run dev:client
```

### Production

1. Build the client:
```bash
npm run build:client
```

2. Start the server:
```bash
npm run start:server
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
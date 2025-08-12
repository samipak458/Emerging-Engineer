# Azure Image CRUD (Simple JS Full Stack)

A minimal full-stack JavaScript app:
- Backend: Node.js + Express
- Storage: Azure Blob Storage (images, public read)
- Database: SQLite (image metadata)
- Frontend: Vanilla JS served by Express

## Features
- Create: upload an image with title/description
- Read: list and view images
- Update: edit title/description, optionally replace the image
- Delete: remove image and its metadata

## Prerequisites
- Node.js 18+
- Azure Storage Account (with access keys)
- An Azure Blob container (this app auto-creates if missing)

## Setup

1. Go to the app folder:
   ```bash
   cd apps/azure-image-crud
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` from example and fill values:
   ```bash
   cp .env.example .env
   # edit .env with your connection string and container name
   ```

4. Run the server:
   ```bash
   npm run start
   # then open http://localhost:3000
   ```

The app will:
- Ensure the blob container exists (with blob-level public read for simplicity).
- Create `data/app.db` for metadata.

## Environment Variables
- `AZURE_STORAGE_CONNECTION_STRING`: from Azure portal
- `AZURE_STORAGE_CONTAINER_NAME`: e.g. `images`
- `PORT`: default `3000`
- `DATABASE_FILE`: default `data/app.db`
- `MAX_FILE_SIZE_MB`: default `5`

## Notes and Best Practices
- For simplicity, the container is set to blob-level public access so the frontend can display image URLs directly. For production, consider private containers with short-lived SAS URLs.
- Validate allowed file types and reasonable size limits (configured in server).
- Do not expose your Azure connection string to the frontend.
- SQLite is used for convenience; swap with a managed DB if needed.

## API
- `GET /api/images` → list images
- `GET /api/images/:id` → get one
- `POST /api/images` (multipart/form-data with fields: `title`, `description?`, `image`) → create
- `PUT /api/images/:id` (multipart/form-data, `title?`, `description?`, `image?`) → update
- `DELETE /api/images/:id` → delete

## Folder Structure
```
apps/azure-image-crud
├─ src/
│  ├─ server.js        # Express app + routes
│  ├─ azure.js         # Azure Blob helpers
│  └─ db.js            # SQLite helpers
├─ public/
│  ├─ index.html
│  ├─ style.css
│  └─ app.js
├─ data/               # SQLite database (created at runtime)
├─ .env.example
├─ .gitignore
├─ package.json
└─ README.md
```

## Azure Setup Quick Guide
1. Create a Storage Account in Azure Portal.
2. Get the Connection String (Access keys).
3. Set `AZURE_STORAGE_CONNECTION_STRING` in `.env`.
4. Set `AZURE_STORAGE_CONTAINER_NAME` to desired container (e.g., `images`).
5. Start the app; it will create the container if needed.

## License
MIT
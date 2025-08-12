import "dotenv/config";
import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { ensureContainer, uploadImage, deleteImage } from "./azure.js";
import { createImage, listImages, getImage, updateImage, deleteImageRow } from "./db.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "5", 10);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
    } else {
      cb(null, true);
    }
  }
});

// Static frontend
app.use(express.static(publicDir));

// Health
app.get("/healthz", (req, res) => res.json({ ok: true }));

// List images
app.get("/api/images", (req, res) => {
  const items = listImages();
  res.json(items);
});

// Get single image
app.get("/api/images/:id", (req, res) => {
  const item = getImage(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// Create (upload) image
app.post("/api/images", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!req.file) return res.status(400).json({ error: "Image file is required" });

    const { buffer, mimetype, originalname, size } = req.file;
    const { blobName, url } = await uploadImage({
      buffer,
      contentType: mimetype,
      originalName: originalname
    });

    const record = createImage({
      title,
      description,
      blobName,
      url,
      contentType: mimetype,
      size
    });

    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

// Update metadata and/or replace image
app.put("/api/images/:id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    const existing = getImage(id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    let newBlobName = null;
    let newUrl = null;
    let newContentType = null;
    let newSize = null;

    if (req.file) {
      const { buffer, mimetype, originalname, size } = req.file;
      const { blobName, url } = await uploadImage({
        buffer,
        contentType: mimetype,
        originalName: originalname
      });
      newBlobName = blobName;
      newUrl = url;
      newContentType = mimetype;
      newSize = size;

      // Delete the old blob after new upload succeeds
      await deleteImage(existing.blobName);
    }

    const updated = updateImage(id, {
      title: req.body.title ?? null,
      description: req.body.description ?? null,
      blobName: newBlobName,
      url: newUrl,
      contentType: newContentType,
      size: newSize
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Update failed" });
  }
});

// Delete image
app.delete("/api/images/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = deleteImageRow(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    // Best-effort delete of blob
    await deleteImage(deleted.blobName);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Delete failed" });
  }
});

const PORT = process.env.PORT || 3000;

ensureContainer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Open http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error("Failed to ensure container:", e);
    process.exit(1);
  });
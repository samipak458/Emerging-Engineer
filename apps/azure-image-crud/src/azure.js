import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "crypto";

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "images";

if (!connStr) {
  console.error("Missing AZURE_STORAGE_CONNECTION_STRING in environment.");
  process.exit(1);
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Ensure container exists with blob-level public access for simple viewing
export async function ensureContainer() {
  const res = await containerClient.createIfNotExists({ access: "blob" });
  if (res.succeeded) {
    console.log(`Container '${containerName}' created with blob public access.`);
  } else {
    console.log(`Container '${containerName}' exists.`);
  }
}

function makeBlobName(originalName) {
  const ext = originalName?.split(".").pop() || "bin";
  const id = crypto.randomUUID();
  return `${id}.${ext}`;
}

export async function uploadImage({ buffer, contentType, originalName }) {
  const blobName = makeBlobName(originalName || "image");
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType || "application/octet-stream" }
  });
  const url = blockBlobClient.url;
  return { blobName, url };
}

export async function deleteImage(blobName) {
  if (!blobName) return;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  try {
    await blockBlobClient.deleteIfExists();
  } catch (e) {
    console.warn("deleteImage error (ignored):", e.message);
  }
}
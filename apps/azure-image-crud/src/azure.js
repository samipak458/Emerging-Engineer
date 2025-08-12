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
  // Create the container if missing; request blob-level public access at creation time
  const res = await containerClient.createIfNotExists({ access: "blob" });
  if (res.succeeded) {
    console.log(`Container '${containerName}' created with blob public access.`);
  } else {
    console.log(`Container '${containerName}' exists.`);
  }

  // Ensure public access is set even if the container already existed
  try {
    await containerClient.setAccessPolicy("blob");
    console.log(`Confirmed public access 'blob' for container '${containerName}'.`);
  } catch (e) {
    // If account-level public access is disabled, Azure returns PublicAccessNotPermitted
    if (e?.details?.errorCode === "PublicAccessNotPermitted" || /PublicAccessNotPermitted/i.test(e?.message || "")) {
      console.warn(
        "Storage account disallows public blob access. Enable it or switch to SAS/AAD.\n" +
          "To enable (CLI): az storage account update -g <RG> -n <ACCOUNT> --allow-blob-public-access true\n" +
          `Then set container ACL: az storage container set-permission --public-access blob -n ${containerName} --connection-string "$AZURE_STORAGE_CONNECTION_STRING"`
      );
    } else {
      console.warn("Failed to set container public access:", e.message || e);
    }
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
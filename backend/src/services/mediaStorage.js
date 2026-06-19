const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const env = require("../config/env");

let cloudinaryUploader = null;
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

if (env.mediaStorageProvider === "cloudinary") {
  try {
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
    });
    cloudinaryUploader = cloudinary.uploader;
  } catch (e) {
    throw new Error(`Cloudinary init failed: ${e && e.message}`);
  }
}

function encodeStoragePath(storagePath) {
  return storagePath.split("/").map(encodeURIComponent).join("/");
}

function publicSupabaseUrl(storagePath) {
  const baseUrl = env.supabase.url.replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(
    env.supabase.storageBucket,
  )}/${encodeStoragePath(storagePath)}`;
}

async function uploadSupabaseObject(buffer, storagePath, contentType) {
  const baseUrl = env.supabase.url.replace(/\/$/, "");
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${encodeURIComponent(
      env.supabase.storageBucket,
    )}/${encodeStoragePath(storagePath)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
        apikey: env.supabase.serviceRoleKey,
        "Content-Type": contentType || "application/octet-stream",
        "x-upsert": "true",
      },
      body: buffer,
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      `Supabase upload failed: ${response.status}${message ? ` ${message}` : ""}`,
    );
  }

  return {
    secure_url: publicSupabaseUrl(storagePath),
    public_id: storagePath,
  };
}

async function removeSupabaseObject(storagePath) {
  const baseUrl = env.supabase.url.replace(/\/$/, "");
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${encodeURIComponent(env.supabase.storageBucket)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
        apikey: env.supabase.serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: [storagePath] }),
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      `Supabase delete failed: ${response.status}${message ? ` ${message}` : ""}`,
    );
  }

  return { result: "deleted" };
}

async function uploadFile(filePath, options = {}) {
  if (cloudinaryUploader) {
    return cloudinaryUploader.upload(filePath, options);
  }

  if (env.mediaStorageProvider === "supabase") {
    const extension = path.extname(filePath).toLowerCase() || ".bin";
    const storagePath =
      options.publicId || options.public_id || `${Date.now()}-${randomUUID()}${extension}`;
    const buffer = await fsp.readFile(filePath);
    return uploadSupabaseObject(buffer, storagePath, options.contentType);
  }

  if (env.mediaStorageProvider === "local") {
    if (fs.existsSync(filePath))
      return { secure_url: null, public_id: null, localPath: filePath };
    return { secure_url: null, public_id: null };
  }

  throw new Error(`Unsupported media storage provider: ${env.mediaStorageProvider}`);
}

async function storeUploadedImage(file) {
  if (!file) throw new Error("Image file is required");

  if (cloudinaryUploader) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinaryUploader.upload_stream(
        { folder: env.cloudinary.folder },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );
      stream.end(file.buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      provider: "cloudinary",
    };
  }

  if (env.mediaStorageProvider === "supabase") {
    const extension =
      path.extname(file.originalname || "").toLowerCase() || ".png";
    const storagePath = `uploads/${Date.now()}-${randomUUID()}${extension}`;
    const result = await uploadSupabaseObject(
      file.buffer,
      storagePath,
      file.mimetype,
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      provider: "supabase",
    };
  }

  await fsp.mkdir(uploadsDir, { recursive: true });
  const extension =
    path.extname(file.originalname || "").toLowerCase() || ".png";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(uploadsDir, filename);
  await fsp.writeFile(filePath, file.buffer);

  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    provider: "local",
  };
}

async function removeFile(publicId) {
  if (cloudinaryUploader) {
    return cloudinaryUploader.destroy(publicId);
  }

  if (env.mediaStorageProvider === "supabase") {
    if (!publicId) return { result: "deleted" };
    return removeSupabaseObject(publicId);
  }

  if (env.mediaStorageProvider === "local") {
    if (publicId) {
      await fsp.rm(path.join(uploadsDir, path.basename(publicId)), { force: true });
    }
    return { result: "deleted" };
  }

  throw new Error(`Unsupported media storage provider: ${env.mediaStorageProvider}`);
}

module.exports = { uploadFile, storeUploadedImage, removeFile };

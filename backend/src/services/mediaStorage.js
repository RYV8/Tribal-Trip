const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

let uploader = null;
const hasCloudinary =
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME;
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

if (hasCloudinary) {
  try {
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    uploader = cloudinary.uploader;
  } catch (e) {
    console.warn(
      "Cloudinary init failed, falling back to local storage:",
      e && e.message,
    );
  }
} else {
  console.warn(
    "Cloudinary not configured — falling back to local storage/no-op uploader",
  );
}

async function uploadFile(filePath, options = {}) {
  if (!uploader) {
    if (fs.existsSync(filePath))
      return { secure_url: null, public_id: null, localPath: filePath };
    return { secure_url: null, public_id: null };
  }
  return uploader.upload(filePath, options);
}

async function storeUploadedImage(file) {
  if (!file) throw new Error("Image file is required");

  if (uploader) {
    const result = await new Promise((resolve, reject) => {
      const stream = uploader.upload_stream(
        { folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "tribe-trip" },
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
  if (!uploader) {
    if (publicId) {
      await fsp.rm(path.join(uploadsDir, publicId), { force: true });
    }
    return { result: "deleted" };
  }
  return uploader.destroy(publicId);
}

module.exports = { uploadFile, storeUploadedImage, removeFile };

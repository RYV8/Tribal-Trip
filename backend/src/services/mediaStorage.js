const fs = require('fs')

let uploader = null
const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME

if (hasCloudinary) {
  try {
    const cloudinary = require('cloudinary').v2
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    uploader = cloudinary.uploader
  } catch (e) {
    console.warn('Cloudinary init failed, falling back to local storage:', e && e.message)
  }
} else {
  console.warn('Cloudinary not configured — falling back to local storage/no-op uploader')
}

async function uploadFile(filePath, options = {}) {
  if (!uploader) {
    if (fs.existsSync(filePath)) return { secure_url: null, public_id: null, localPath: filePath }
    return { secure_url: null, public_id: null }
  }
  return uploader.upload(filePath, options)
}

async function removeFile(publicId) {
  if (!uploader) return { result: 'not-configured' }
  return uploader.destroy(publicId)
}

module.exports = { uploadFile, removeFile }

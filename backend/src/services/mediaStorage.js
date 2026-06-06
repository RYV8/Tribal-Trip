const crypto = require('crypto')
const fs = require('fs/promises')
const path = require('path')
const { v2: cloudinary } = require('cloudinary')
const env = require('../config/env')

const uploadDir = path.join(__dirname, '..', '..', 'uploads')

function extensionFor(file) {
  const extension = path.extname(file.originalname || '').toLowerCase()
  if (extension) return extension
  if (file.mimetype === 'image/jpeg') return '.jpg'
  if (file.mimetype === 'image/png') return '.png'
  if (file.mimetype === 'image/webp') return '.webp'
  return '.jpg'
}

function randomPublicId(file) {
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extensionFor(file)}`
}

async function storeLocalImage(file, req) {
  await fs.mkdir(uploadDir, { recursive: true })
  const publicId = randomPublicId(file)
  await fs.writeFile(path.join(uploadDir, publicId), file.buffer)

  return {
    provider: 'local',
    publicId,
    url: `${req.protocol}://${req.get('host')}/uploads/${publicId}`,
  }
}

function uploadCloudinaryBuffer(file) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  })

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.folder,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error)
        return resolve(result)
      },
    )
    stream.end(file.buffer)
  })
}

async function storeCloudinaryImage(file) {
  const result = await uploadCloudinaryBuffer(file)
  return {
    provider: 'cloudinary',
    publicId: result.public_id,
    url: result.secure_url,
  }
}

function storeUploadedImage(file, req) {
  if (env.mediaStorageProvider === 'cloudinary') return storeCloudinaryImage(file)
  return storeLocalImage(file, req)
}

module.exports = { storeUploadedImage }

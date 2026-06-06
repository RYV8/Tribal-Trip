const express = require('express')
const path = require('path')
const multer = require('multer')
const { protect, editorOnly, adminOnly } = require('../middleware/auth')
const admin = require('../controllers/adminController')
const { ApiError } = require('../utils/http')
const { validate } = require('../middleware/validate')
const schemas = require('../validation/schemas')

const router = express.Router()
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase()
    if (!allowedImageMimeTypes.has(file.mimetype) || !allowedImageExtensions.has(extension)) {
      return callback(new ApiError(400, 'Only JPG, PNG, and WebP images are allowed'))
    }
    return callback(null, true)
  },
})

router.use(protect, editorOnly)

router.get('/audit-logs', adminOnly, validate({ query: schemas.auditQuery }), admin.listAuditLogs)
router.get('/users', adminOnly, admin.listUsers)
router.patch('/users/:id', adminOnly, validate({ params: schemas.idParam, body: schemas.updateUserBody }), admin.updateUser)
router.get('/countries', adminOnly, admin.listCountries)
router.post('/countries', adminOnly, validate({ body: schemas.createCountryBody }), admin.createCountry)
router.put('/countries/:slug', adminOnly, validate({ params: schemas.slugParam, body: schemas.updateCountryBody }), admin.updateCountry)
router.get('/culture-guides', admin.listCultureGuides)
router.put('/culture-guides/:countrySlug', validate({ params: schemas.countrySlugParam, body: schemas.upsertCultureGuideBody }), admin.upsertCultureGuide)
router.delete('/culture-guides/:countrySlug', adminOnly, validate({ params: schemas.countrySlugParam }), admin.archiveCultureGuide)
router.get('/sources', validate({ query: schemas.sourceQuery }), admin.listSources)
router.post('/sources', validate({ body: schemas.createSourceBody }), admin.createSource)
router.put('/sources/:id', validate({ params: schemas.idParam, body: schemas.updateSourceBody }), admin.updateSource)
router.delete('/sources/:id', adminOnly, validate({ params: schemas.idParam }), admin.deleteSource)
router.post('/media', imageUpload.single('image'), validate({ body: schemas.mediaBody }), admin.uploadMedia)

router.get('/locations', validate({ query: schemas.statusQuery }), admin.listLocations)
router.post('/locations', validate({ body: schemas.createLocationBody }), admin.createLocation)
router.put('/locations/:slug', validate({ params: schemas.slugParam, body: schemas.updateLocationBody }), admin.updateLocation)
router.delete('/locations/:slug', validate({ params: schemas.slugParam }), admin.archiveLocation)

router.get('/stories', validate({ query: schemas.statusQuery }), admin.listStories)
router.post('/stories', validate({ body: schemas.createStoryBody }), admin.createStory)
router.put('/stories/:slug', validate({ params: schemas.slugParam, body: schemas.updateStoryBody }), admin.updateStory)
router.delete('/stories/:slug', validate({ params: schemas.slugParam }), admin.archiveStory)

router.get('/artifacts', validate({ query: schemas.statusQuery }), admin.listArtifacts)
router.post('/artifacts', validate({ body: schemas.createArtifactBody }), admin.createArtifact)
router.put('/artifacts/:slug', validate({ params: schemas.slugParam, body: schemas.updateArtifactBody }), admin.updateArtifact)
router.delete('/artifacts/:slug', validate({ params: schemas.slugParam }), admin.archiveArtifact)

router.get('/local-secrets', validate({ query: schemas.localSecretsQuery }), admin.getLocalSecretsQueue)
router.patch('/local-secrets/:id', validate({ params: schemas.idParam, body: schemas.localSecretModerationBody }), admin.updateLocalSecretStatus)

module.exports = router

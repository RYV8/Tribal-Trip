const router = require('express').Router()
const ctrl = require('../controllers/profileController')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const schemas = require('../validation/schemas')

router.get('/', protect, ctrl.getProfile)
router.put('/', protect, validate({ body: schemas.profileBody }), ctrl.updateProfile)

module.exports = router

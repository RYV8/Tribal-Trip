const router = require('express').Router()
const ctrl = require('../controllers/localSecretsController')
const { optionalAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const schemas = require('../validation/schemas')

router.get('/', validate({ query: schemas.localSecretsQuery }), ctrl.getPublished)
router.post('/', optionalAuth, validate({ body: schemas.localSecretBody }), ctrl.create)
router.post('/:id/helpful', validate({ params: schemas.idParam }), ctrl.markHelpful)

module.exports = router

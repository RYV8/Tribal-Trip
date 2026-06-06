const router = require('express').Router()
const ctrl = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const schemas = require('../validation/schemas')

router.post('/register', validate({ body: schemas.registerBody }), ctrl.register)
router.post('/login', validate({ body: schemas.loginBody }), ctrl.login)
router.get('/me', protect, ctrl.me)

module.exports = router

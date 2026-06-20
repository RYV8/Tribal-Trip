const router = require('express').Router()
const ctrl = require('../controllers/mapController')

router.get('/', ctrl.getAvailability)
router.get('/availability', ctrl.getAvailability)

module.exports = router

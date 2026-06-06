const router = require('express').Router()
const ctrl = require('../controllers/cultureGuidesController')

router.get('/', ctrl.getAll)
router.get('/:countrySlug', ctrl.getByCountry)

module.exports = router

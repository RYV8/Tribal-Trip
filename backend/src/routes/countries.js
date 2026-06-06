const router = require("express").Router();
const ctrl = require("../controllers/countriesController");

router.get("/", ctrl.getAll);
router.get("/:slug", ctrl.getOne);

module.exports = router;

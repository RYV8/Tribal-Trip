const router = require("express").Router();
const ctrl = require("../controllers/favoritesController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const schemas = require("../validation/schemas");

router.get("/", protect, ctrl.getAll);
router.post("/", protect, validate({ body: schemas.favoriteBody }), ctrl.add);
router.delete("/", protect, validate({ body: schemas.favoriteBody }), ctrl.remove);

module.exports = router;

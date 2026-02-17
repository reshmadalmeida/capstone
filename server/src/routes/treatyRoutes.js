const express = require("express");
const router = express.Router();
const treatyController = require("../controllers/treatyController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleGuard");

router.post(
  "/create",
  protect,
  authorize("REINSURANCE_ANALYST"),
  treatyController.createTreaty,
);
router.get(
  "/",
  protect,
  authorize("REINSURANCE_ANALYST"),
  treatyController.getTreaties,
);
router.put(
  "/:id",
  protect,
  authorize("REINSURANCE_ANALYST"),
  treatyController.updateTreaty,
);

module.exports = router;

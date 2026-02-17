const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claimController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleGuard");

router.post(
  "/",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.createClaim,
);
router.get(
  "/",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.getClaims,
);
router.put(
  "/:id",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.updateClaim,
);

module.exports = router;

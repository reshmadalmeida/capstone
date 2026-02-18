const express = require("express");
const router = express.Router();
const policyController = require("../controllers/policyController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleGuard");

router.post(
  "/",
  protect,
  authorize("UNDERWRITER","ADMIN"),
  policyController.createPolicy,
);
router.get(
  "/",
  protect,
  authorize("UNDERWRITER","ADMIN"),
  policyController.getPolicies,
);
router.get(
  "/:id",
  protect,
  authorize("UNDERWRITER","ADMIN"),
  policyController.getPolicyById,
);
router.put(
  "/:id",
  protect,
  authorize("UNDERWRITER","ADMIN"),
  policyController.updatePolicy,
);
router.post(
  "/:policyId/approve",
  protect,
  authorize("UNDERWRITER","ADMIN"),
  policyController.approvePolicy,
);


module.exports = router;

const express = require("express");
const router = express.Router();
const riskAllocationController = require("../controllers/riskAllocationController");
const { protect } = require("../middleware/authMiddleware");

// FR-7: Auto-allocate risk using treaty rules
router.post("/allocate/:policyNumber", protect, riskAllocationController.allocateRisk);

// FR-8: Validate allocation against limits
router.post("/validate", protect, riskAllocationController.validateAllocation);

// FR-9: Calculate exposure
router.post("calculate-exposure/:policyNumber", protect, riskAllocationController.calculateExposure);

// Get allocations for a policy
router.get("/:policyNumber", riskAllocationController.getAllocationByPolicy);

module.exports = router;

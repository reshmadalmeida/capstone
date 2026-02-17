const express = require("express");
const router = express.Router();
const riskAllocationController = require("../controllers/riskAllocationController");
const authMiddleware = require("../middleware/authMiddleware");

// FR-7: Auto-allocate risk using treaty rules
router.post("/allocate/:policyId", authMiddleware, riskAllocationController.allocateRisk);

// FR-8: Validate allocation against limits
router.post("/validate", authMiddleware, riskAllocationController.validateAllocation);

// FR-9: Calculate exposure
router.post("/calculate-exposure/:policyId", authMiddleware, riskAllocationController.calculateExposure);

// Get allocations for a policy
router.get("/:policyId", riskAllocationController.getAllocationByPolicy);

module.exports = router;

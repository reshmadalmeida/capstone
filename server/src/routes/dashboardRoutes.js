const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/dashboardController");

router.get("/exposure-lob", ctrl.getExposureByLOB);
router.get("/reinsurer-distribution", ctrl.getReinsurerDistribution);
router.get("/loss-ratio", ctrl.getLossRatio);
router.get("/monthly-claims", ctrl.getMonthlyClaimsTrend);
router.get("/retention-vs-ceded", ctrl.getRetentionVsCeded);
router.get("/high-claim-policies", ctrl.getHighClaimPolicies);

module.exports = router;

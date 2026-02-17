const Policy = require("../models/Policy");
const RiskAllocation = require("../models/RiskAllocation");
const Claim = require("../models/Claim");

exports.getExposureByLOB = async (req, res) => {
  try {
    const data = await Policy.aggregate([
      { $match: { status: "ACTIVE", isDeleted: false } },
      {
        $group: {
          _id: "$lineOfBusiness",
          totalSumInsured: { $sum: "$sumInsured" },
          totalPremium: { $sum: "$premium" },
          policyCount: { $sum: 1 },
        },
      },
      { $sort: { totalSumInsured: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReinsurerDistribution = async (req, res) => {
  try {
    const data = await RiskAllocation.aggregate([
      { $unwind: "$allocations" },
      {
        $group: {
          _id: "$allocations.reinsurerId",
          totalCededAmount: { $sum: "$allocations.allocatedAmount" },
          avgCededPercentage: { $avg: "$allocations.allocatedPercentage" },
        },
      },
      {
        $lookup: {
          from: "reinsurers",
          localField: "_id",
          foreignField: "_id",
          as: "reinsurer",
        },
      },
      { $unwind: "$reinsurer" },
      {
        $project: {
          _id: "$reinsurer.name",
          totalCededAmount: 1,
          avgCededPercentage: 1,
        },
      },
      { $sort: { totalCededAmount: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Claims Ratio (Loss Ratio)
exports.getLossRatio = async (req, res) => {
  try {
    const totalClaims = await Claim.aggregate([
      { $match: { status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$approvedAmount" } } },
    ]);

    const totalPremium = await Policy.aggregate([
      { $match: { status: "ACTIVE", isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$premium" } } },
    ]);

    const claims = totalClaims[0]?.total || 0;
    const premium = totalPremium[0]?.total || 0;

    const ratio = premium === 0 ? 0 : (claims / premium) * 100;

    res.json({
      totalApprovedClaims: claims,
      totalPremium: premium,
      lossRatioPercentage: ratio.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Monthly Claims Trend
exports.getMonthlyClaimsTrend = async (req, res) => {
  try {
    const data = await Claim.aggregate([
      {
        $match: { status: "APPROVED" },
      },
      {
        $group: {
          _id: {
            year: { $year: "$incidentDate" },
            month: { $month: "$incidentDate" },
          },
          totalClaimsAmount: { $sum: "$approvedAmount" },
          claimCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Retained vs Ceded Exposure
exports.getRetentionVsCeded = async (req, res) => {
  try {
    const totalCeded = await RiskAllocation.aggregate([
      { $unwind: "$allocations" },
      {
        $group: {
          _id: null,
          totalCeded: { $sum: "$allocations.allocatedAmount" },
        },
      },
    ]);

    const totalRetained = await RiskAllocation.aggregate([
      {
        $group: {
          _id: null,
          totalRetained: { $sum: "$retainedAmount" },
        },
      },
    ]);

    res.json({
      totalCeded: totalCeded[0]?.totalCeded || 0,
      totalRetained: totalRetained[0]?.totalRetained || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Top 5 High Claim Policies
exports.getHighClaimPolicies = async (req, res) => {
  try {
    const data = await Claim.aggregate([
      { $match: { status: "APPROVED" } },

      {
        $group: {
          _id: "$policyId",
          totalClaimAmount: { $sum: "$approvedAmount" },
        },
      },

      { $sort: { totalClaimAmount: -1 } },
      { $limit: 5 },

      {
        $lookup: {
          from: "policies",
          localField: "_id",
          foreignField: "_id",
          as: "policy",
        },
      },

      { $unwind: "$policy" },

      {
        $project: {
          _id: 0,
          policyNumber: "$policy.policyNumber",
          totalClaimAmount: 1,
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

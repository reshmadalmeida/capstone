const RiskAllocation = require("../models/RiskAllocation");
const Policy = require("../models/Policy");
const { reinsuranceEngine } = require("../services/reinsuranceEngine");
const AuditLog = require("../models/AuditLog");
const Treaty = require("../models/Treaty");
exports.getAllocationByPolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    const policy = await Policy.findOne({
      policyNumber: policyId,
      status: "ACTIVE",
    });
    if (!policy) {
      return res.json({ message: "Policy not found" });
    }
    let allocations = await RiskAllocation.find({
      policyId: policy._id,
    })
      .populate("allocations.reinsurerId")
      .populate("allocations.treatyId");
    if (allocations.length) {
      res.json(allocations);
    } else {
      res.json({ message: "No risk allocation found." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * FR-7: Automatically allocate risk using treaty rules
 * Triggers the reinsurance engine to calculate allocations based on active treaties
 */
exports.allocateRisk = async (req, res) => {
  try {
    const { policyId } = req.params;
    const userId = req.user?.id || req.user?._id;

    // Find the policy
    const policy = await Policy.findOne({
      policyNumber: policyId,
      status: "ACTIVE",
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // Check if allocation already exists
    const existingAllocation = await RiskAllocation.findOne({
      policyId: policy._id,
    });

    if (existingAllocation) {
      return res.json(existingAllocation.populate("allocations.reinsurerId").populate("allocations.treatyId"));
    }

    // Use reinsurance engine to allocate risk
    const allocation = await reinsuranceEngine(policy, userId);

    if (allocation.message) {
      return res.json(allocation);
    }

    // Log the allocation action
    if (userId) {
      await AuditLog.create({
        userId,
        action: "ALLOCATE_RISK",
        resource: "POLICY",
        resourceId: policy._id,
        description: `Risk automatically allocated for policy ${policyId}`,
        status: "SUCCESS",
      });
    }

    // Populate and return
    await allocation.populate("allocations.reinsurerId");
    await allocation.populate("allocations.treatyId");

    res.json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.validateAllocation = async (req, res) => {
  try {
    const { policyId, allocations = [] } = req.body;

    if (!policyId) {
      return res.status(400).json({ message: "policyId is required" });
    }

    // Same lookup style as your allocateRisk()
    const policy = await Policy.findOne({
      policyNumber: policyId,
      status: "ACTIVE",
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const exposure = Number(policy.sumInsured || 0);
    const retention = Number(policy.retentionLimit || 0);

    const violations = [];

    if (exposure <= 0) {
      violations.push("Policy sumInsured must be > 0");
    }

    if (retention < 0) {
      violations.push("Policy retentionLimit cannot be negative");
    }

    const cedableCapacity = Math.max(0, exposure - retention);

    let totalCeded = 0;

    for (const a of allocations) {
      const allocatedAmount = Number(a?.allocatedAmount || 0);
      const treatyId = a?.treatyId?._id || a?.treatyId;

      if (!treatyId) {
        violations.push("Allocation missing treatyId");
        continue;
      }

      const treaty =
        a?.treatyId?.treatyLimit != null ? a.treatyId : await Treaty.findById(treatyId);

      if (!treaty) {
        violations.push(`Treaty not found for treatyId: ${String(treatyId)}`);
        continue;
      }

      if (!Number.isFinite(allocatedAmount) || allocatedAmount <= 0) {
        violations.push(
          `Allocated amount must be > 0 for treaty ${treaty.treatyName || treaty._id}`
        );
        continue;
      }

      const treatyLimit = Number(treaty.treatyLimit || 0);

      // ✅ Treaty limit check
      if (treatyLimit > 0 && allocatedAmount > treatyLimit) {
        violations.push(
          `Allocated amount (${allocatedAmount}) exceeds treaty limit (${treatyLimit}) for ${treaty.treatyName}`
        );
      }

      totalCeded += allocatedAmount;
    }

    // ✅ Policy retention enforcement
    if (totalCeded > cedableCapacity) {
      violations.push(
        `Total ceded (${totalCeded}) exceeds cedable capacity (${cedableCapacity}) based on retentionLimit (${retention})`
      );
    }

    const retainedAmount = Math.max(0, exposure - totalCeded);

    if (retainedAmount < retention) {
      violations.push(
        `Retained amount (${retainedAmount}) is below retentionLimit (${retention})`
      );
    }

    return res.json({
      valid: violations.length === 0,
      violations,
      totals: {
        sumInsured: exposure,
        retentionLimit: retention,
        cededAmount: totalCeded,
        retainedAmount,
        cedableCapacity,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// /**
//  * FR-8: Validate allocation against treaty and retention limits
//  * Checks that allocated amounts don't exceed treaty limits or retention limits
//  */
// exports.validateAllocation = async (req, res) => {
//   try {
//     const { policyId, allocations } = req.body;

//     const violations = [];

//     // Validate each allocation
//     for (const allocation of allocations) {
//       const treatyId = allocation.treatyId._id || allocation.treatyId;
//       const allocatedAmount = allocation.allocatedAmount;

//       // Check retention limit (retained amount should be >= retention limit for surplus)
//       if (allocation.treatyId.retentionLimit) {
//         if (allocatedAmount > allocation.treatyId.treatyLimit) {
//           violations.push(
//             `Allocated amount (${allocatedAmount}) exceeds treaty limit (${allocation.treatyId.treatyLimit})`
//           );
//         }
//       }

//       // Check treaty limit
//       if (allocatedAmount > allocation.treatyId.treatyLimit) {
//         violations.push(
//           `Allocated amount exceeds treaty limit for ${allocation.treatyId.treatyName}`
//         );
//       }
//     }

//     res.json({
//       valid: violations.length === 0,
//       violations,
//       timestamp: new Date(),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

/**
 * FR-9: Calculate retained and ceded exposures
 * Returns detailed exposure breakdown for a policy
 */
exports.calculateExposure = async (req, res) => {
  try {
    const { policyNumber } = req.params;

    const policy = await Policy.findOne({
      policyNumber: policyNumber,
      status: "ACTIVE",
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const allocations = await RiskAllocation.find({
      policyId: policy.policyNumber,
    })
      .populate("allocations.reinsurerId")
      .populate("allocations.treatyId");

    if (allocations.length === 0) {
      return res.json({ message: "No allocations found for this policy" });
    }

    const allocation = allocations[0];
    const totalExposure = policy.sumInsured;
    const cededAmount = allocation.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
    const retainedAmount = allocation.retainedAmount || totalExposure - cededAmount;

    const exposureData = {
      policyId,
      policyNumber: policy.policyNumber,
      totalExposure,
      retainedAmount,
      retainedPercentage: ((retainedAmount / totalExposure) * 100).toFixed(2),
      cededAmount,
      cededPercentage: ((cededAmount / totalExposure) * 100).toFixed(2),
      allocations: allocation.allocations.map((a) => ({
        reinsurer: a.reinsurerId.name,
        treaty: a.treatyId.treatyName,
        allocatedAmount: a.allocatedAmount,
        allocatedPercentage: a.allocatedPercentage,
      })),
      calculatedAt: new Date(),
    };

    res.json(exposureData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Reinsurance Engine

const Treaty = require("../models/Treaty");
const RiskAllocation = require("../models/RiskAllocation");

exports.reinsuranceEngine = async (policy, underWriterUserid) => {
  console.log("Now:", new Date());
  const treaty = await Treaty.findOne({
    status: "ACTIVE",
    applicableLOBs: policy.lineOfBusiness,
    effectiveTo: { $gte: new Date() },
  });

  if (!treaty) {
    return { message: "No active treaty found. Risk not allocated." };
  }

  const policySumInsured = policy.sumInsured;
  let cededAmount = 0; //ceded is the risk amount for reinsurer
  let cededPercentage = 0;

  if (treaty.treatyType === "QUOTA_SHARE") {
    cededPercentage = treaty.sharePercentage;
    cededAmount = (policySumInsured * cededPercentage) / 100;
  } else if (treaty.treatyType === "SURPLUS") {
    if (policySumInsured > treaty.retentionLimit) {
      const surplus = policySumInsured - treaty.retentionLimit;
      cededAmount = Math.min(surplus, treaty.treatyLimit);
      cededPercentage = (cededAmount / policySumInsured) * 100;
    } else {
      cededAmount = 0;
      cededPercentage = 0;
    }
  } else {
    return { message: "Treaty type not found" };
  }
  const retainedAmount = policySumInsured - cededAmount;

  if (cededAmount === 0) {
    return { message: "No risk ceded under treaty conditions." };
  }

  const allocationDoc = await RiskAllocation.create({
    policyId: policy._id,
    allocations: [
      {
        reinsurerId: treaty.reinsurerId,
        treatyId: treaty._id,
        allocatedAmount: cededAmount,
        allocatedPercentage: cededPercentage,
      },
    ],
    retainedAmount,
    calculatedAt: new Date(),
    calculatedBy: underWriterUserid,
  });

  return allocationDoc;
};

const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const { getClientIp, createAuditLog } = require("../services/helperService");

exports.createClaim = async (req, res) => {
  try {
    const lastClaim = await Claim.findOne({})
      .sort({ claimNumber: -1 })
      .select("claimNumber");
    let nextClaimNumber = "C001";
    if (lastClaim && lastClaim.claimNumber) {
      const lastNumber = parseInt(lastClaim.claimNumber.replace("C", ""), 10);
      const incremented = lastNumber + 1;
      nextClaimNumber = `C${String(incremented).padStart(3, "0")}`;
    }
    const policy = await Policy.findOne({
      policyNumber: req.body.policyNumber,
      status: "ACTIVE",
    });
    if (!policy) {
      return res.json({ message: "No active policy found" });
    }
    console.log(req.body, policy.policyNumber,"req.body")
    const claim = await Claim.create({
      ...req.body,
      claimNumber: nextClaimNumber,
      policyNumber: policy.policyNumber,
      handledBy: req.user._id,
      remarks: JSON.stringify([
        {
          createdAt: new Date(),
          message: "Claim submitted for review.",
        },
      ]),
    });
    console.log(claim,"claim")
    createAuditLog({
      entityType: "CLAIM",
      entityId: claim._id,
      action: "CREATE",
      newValue: claim,
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });
    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("policyNumber")
      .populate("handledBy", "username");
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateClaim = async (req, res) => {
  try {
    const oldValue = await Claim.findById(req.params.id);
    if (!oldValue) {
      return res.status(404).json({ message: "Claim not found" });
    }

    let remarks = [];
    try {
      remarks = oldValue.remarks ? JSON.parse(oldValue.remarks) : [];
      if (!Array.isArray(remarks)) remarks = [];
    } catch {
      remarks = [];
    }

    const policyNumberToUse = req.body.policyNumber || oldValue.policyNumber;

    const policy = await Policy.findOne({
      policyNumber: policyNumberToUse,
      status: "ACTIVE", // optional: remove if you want allow inactive policy update
    });

    if (!policy) {
      return res.status(404).json({
        message: `No active policy found for policyNumber: ${policyNumberToUse}`,
      });
    }

    const { status } = req.body;

    const statusMessages = {
      IN_REVIEW: "Claim updated and resubmitted for review.",
      APPROVED: "Claim approved.",
      REJECTED: "Claim rejected.",
      SETTLED: "Claim settled.",
    };

    if (status && statusMessages[status]) {
      remarks.push({ createdAt: new Date(), message: statusMessages[status] });
    }

    const claim = await Claim.findByIdAndUpdate(
      req.params.id, // ✅ correct
      {
        ...req.body,
        policyNumber: policy.policyNumber, // ✅ always exists now
        remarks: JSON.stringify(remarks),
      },
      { new: true }
    );

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    createAuditLog({
      entityType: "CLAIM",
      entityId: claim._id,
      action: "UPDATE",
      oldValue,
      newValue: claim,
      performedBy: req.user?._id,
      ipAddress: await getClientIp(req),
    });

    return res.json(claim);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

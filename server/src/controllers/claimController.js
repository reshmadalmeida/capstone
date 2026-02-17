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
      policyNumber: req.body.policyId,
      status: "ACTIVE",
    });
    if (!policy) {
      return res.json({ message: "No active policy found" });
    }
    const claim = await Claim.create({
      ...req.body,
      claimNumber: nextClaimNumber,
      policyId: policy._id,
      handledBy: req.user._id,
      remarks: JSON.stringify([
        {
          createdAt: new Date(),
          message: "Claim submitted for review.",
        },
      ]),
    });
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
      .populate("policyId")
      .populate("handledBy", "username");
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClaim = async (req, res) => {
  try {
    const oldValue = await Claim.findById(req.params.id);
    const remarks = JSON.parse(oldValue.remarks);
    const policy = req.body.policyId
      ? await Policy.findOne({
          policyNumber: req.body.policyId,
        })
      : await Policy.findById(oldValue.policyId);
    const { status } = req.body;
    if (status === "IN_REVIEW") {
      remarks.push({
        createdAt: new Date(),
        message: "Claim updated and resubmitted for review.",
      });
    } else if (status === "APPROVED") {
      remarks.push({
        createdAt: new Date(),
        message: "Claim approved.",
      });
    } else if (status === "REJECTED") {
      remarks.push({
        createdAt: new Date(),
        message: "Claim rejected.",
      });
    } else if (status === "SETTLED") {
      remarks.push({
        createdAt: new Date(),
        message: "Claim settled.",
      });
    }
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        policyId: policy._id,
        remarks: JSON.stringify(remarks),
      },
      {
        new: true,
      },
    );
    createAuditLog({
      entityType: "POLICY",
      entityId: claim._id,
      action: "UPDATE",
      oldValue,
      newValue: claim,
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });
    res.json(claim);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

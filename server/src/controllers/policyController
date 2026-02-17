const Policy = require("../models/Policy");
const { getClientIp, createAuditLog } = require("../services/helperService");
const { reinsuranceEngine } = require("../services/reinsuranceEngine");

const parseRemarks = (remarks) => {
  try {
    return remarks ? JSON.parse(remarks) : [];
  } catch {
    return [];
  }
};

const pushRemark = (remarks, message) => {
  remarks.push({
    createdAt: new Date(),
    message,
  });
  return remarks;
};

exports.createPolicy = async (req, res) => {
  try {
    const lastPolicy = await Policy.findOne({})
      .sort({ policyNumber: -1 })
      .select("policyNumber");

    let nextPolicyNumber = "P001";
    if (lastPolicy && lastPolicy.policyNumber) {
      const lastNumber = parseInt(lastPolicy.policyNumber.replace("P", ""), 10);
      const incremented = lastNumber + 1;
      nextPolicyNumber = `P${String(incremented).padStart(3, "0")}`;
    }

    const policy = await Policy.create({
      ...req.body,
      policyNumber: nextPolicyNumber,
      createdBy: req.user._id,
      remarks: JSON.stringify([
        {
          createdAt: new Date(),
          message: "Policy created in DRAFT state.",
        },
      ]),
    });

    createAuditLog({
      entityType: "POLICY",
      entityId: policy._id,
      action: "CREATE",
      newValue: policy,
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPolicies = async (req, res) => {
  try {
    const today = new Date();

    const expiringPolicies = await Policy.find({
      effectiveTo: { $lt: today },
      status: { $ne: "EXPIRED" },
    });

    for (const p of expiringPolicies) {
      const remarks = parseRemarks(p.remarks);
      pushRemark(remarks, "Policy automatically expired after end date.");
      p.status = "EXPIRED";
      p.remarks = JSON.stringify(remarks);
      await p.save();
    }

    const policies = await Policy.find()
      .populate("approvedBy", "username")
      .populate("createdBy", "username");

    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const oldValue = await Policy.findById(req.params.id);

    if (!oldValue) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const remarks = parseRemarks(oldValue.remarks);
    const newStatus = req.body.status || oldValue.status;

    if (req.body.status && req.body.status !== oldValue.status) {
      if (newStatus === "DRAFT") {
        pushRemark(remarks, "Policy moved back to DRAFT.");
      } else if (newStatus === "ACTIVE") {
        pushRemark(remarks, "Policy activated.");
      } else if (newStatus === "EXPIRED") {
        pushRemark(remarks, "Policy expired.");
      }
    } else {
      pushRemark(remarks, "Policy details updated.");
    }

    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        remarks: JSON.stringify(remarks),
      },
      { new: true },
    );

    createAuditLog({
      entityType: "POLICY",
      entityId: policy._id,
      action: "UPDATE",
      oldValue,
      newValue: policy,
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approvePolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    const userId = req.user._id;

    const policy = await Policy.findById(policyId);
    const oldValue = policy;

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    if (policy.status !== "DRAFT") {
      return res.status(400).json({
        message: `Policy is not in DRAFT state. Current state: ${policy.status}`,
      });
    }

    const remarks = parseRemarks(policy.remarks);
    pushRemark(remarks, "Policy approved and activated.");

    policy.status = "ACTIVE";
    policy.approvedBy = userId;
    policy.remarks = JSON.stringify(remarks);

    await policy.save();

    createAuditLog({
      entityType: "POLICY",
      entityId: policy._id,
      action: "APPROVE",
      oldValue,
      newValue: policy,
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });

    const allocation = await reinsuranceEngine(policy, userId);

    return res.status(200).json({
      message: "Policy approved successfully",
      allocation,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

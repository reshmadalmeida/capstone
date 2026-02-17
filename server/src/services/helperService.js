const Policy = require("../models/Policy");
const Treaty = require("../models/Treaty");
const RiskAllocation = require("../models/RiskAllocation");
const AuditLog = require("../models/AuditLog");

exports.getTotalExposure = async () => {
  const result = await Policy.aggregate([
    { $match: { status: "ACTIVE" } },
    { $group: { _id: null, totalExposure: { $sum: "$sumInsured" } } },
  ]);
  return result[0]?.totalExposure || 0;
};

exports.getClientIp = async (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress;
};

exports.createAuditLog = async (log) => {
  await AuditLog.create(log);
};

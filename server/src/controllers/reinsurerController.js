const Reinsurer = require("../models/Reinsurer");
const { getClientIp, createAuditLog } = require("../services/helperService");

exports.createReinsurer = async (req, res) => {
  try {
    const last = await Reinsurer.findOne()
      .sort({ createdAt: -1 })
      .select("code");

    let nextCode = "R001";
    if (last?.code) {
      const num = parseInt(last.code.replace("R", ""), 10) + 1;
      nextCode = `R${String(num).padStart(3, "0")}`;
    }

    const reinsurer = await Reinsurer.create({
      ...req.body,
      code: nextCode,
    });

    await createAuditLog({
      entityType: "REINSURER",
      entityId: reinsurer._id,
      action: "CREATE",
      newValue: reinsurer,
      performedBy: req.user?._id,
      ipAddress: await getClientIp(req),
    });

    res.status(201).json(reinsurer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReinsurers = async (req, res) => {
  try {
    const reinsurers = await Reinsurer.find({ isDeleted: false });
    res.json(reinsurers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReinsurer = async (req, res) => {
  try {
    const oldValue = await Reinsurer.findById(req.params.id);
    const reinsurer = await Reinsurer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );
    createAuditLog({
      entityType: "REINSURER",
      entityId: reinsurer._id,
      action: "UPDATE",
      oldValue,
      newValue: reinsurer,
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });
    res.json(reinsurer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReinsurer = async (req, res) => {
  // Soft delete
  try {
    await Reinsurer.findByIdAndUpdate(req.params.id, {
      status: "INACTIVE",
      isDeleted: true,
    });
    createAuditLog({
      entityType: "REINSURER",
      entityId: req.params.id,
      action: "DELETE",
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });
    res.json({ message: "Reinsurer deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

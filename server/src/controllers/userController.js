const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { getClientIp, createAuditLog } = require("../services/helperService");

exports.createUser = async (req, res) => {
  try {
    const { password, ...safeBody } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({
      ...safeBody,
      passwordHash,
    });
    await createAuditLog({
      entityType: "USER",
      entityId: user._id,
      action: "CREATE",
      newValue: user,
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let body = { ...req.body };

    if (body.password) {
      const password = body.password;
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      delete body.password;
      body.passwordHash = passwordHash;
    }
    const oldValue = await User.findById(req.params.id);
    if (!oldValue) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    await createAuditLog({
      entityType: "USER",
      entityId: user._id,
      action: "UPDATE",
      oldValue,
      newValue: user,
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  // Soft delete
  try {
    await User.findByIdAndUpdate(req.params.id, {
      status: "INACTIVE",
      isDeleted: true,
    });
    await createAuditLog({
      entityType: "USER",
      entityId: req.params.id,
      action: "DELETE",
      performedBy: req.user._id,
      ipAddress: await getClientIp(req),
    });
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
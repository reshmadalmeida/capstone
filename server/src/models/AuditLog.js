const mongoose = require("mongoose");

const { Schema } = mongoose;

const AuditLogSchema = new Schema(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["POLICY", "CLAIM", "REINSURER", "TREATY", "USER"],
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE", "APPROVE"],
    },

    oldValue: {
      type: Schema.Types.Mixed,
      default: null,
    },

    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    performedAt: {
      type: Date,
      default: new Date(),
    },

    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: false,
    collection: "audit_logs",
  },
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);

// models/audit-log.model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ENTITY_TYPES = ["POLICY", "CLAIM", "TREATY", "USER"];
const ACTIONS = ["CREATE", "UPDATE", "DELETE", "APPROVE"];

const AuditLogSchema = new Schema({
    entityType: {
      type: String,
      enum: ENTITY_TYPES,
      required: true,
     
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
     
    },

    action: {
      type: String,
      enum: ACTIONS,
      required: true,
     
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
      default: Date.now,
     
    },

    ipAddress: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: false,
    collection: "audit_logs",
  }
);

module.exports = model('AuditLog', AuditLogSchema);
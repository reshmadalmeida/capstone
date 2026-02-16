// models/treaty.model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const TREATY_TYPES = ["QUOTA_SHARE", "SURPLUS"];
const TREATY_STATUSES = ["ACTIVE", "EXPIRED"];
const LOBS = ["HEALTH", "MOTOR", "LIFE", "PROPERTY"]; // broadened to match system LOBs

const TreatySchema = new Schema({
    _id: ObjectId,
    treatyName: {
      type: String,
      required: true,
      trim: true
    },

    treatyType: {
      type: String,
      enum: TREATY_TYPES,
      required: true
    },

    reinsurerId: {
      type: Schema.Types.ObjectId,
      ref: "Reinsurer",
      required: true,
      index: true
    },

    sharePercentage: {
      type: Number,
      min: [0, "sharePercentage cannot be negative"],
      max: [100, "sharePercentage cannot exceed 100"],
      // Required for QUOTA_SHARE; optional for SURPLUS (business decision)
      validate: {
        validator: function (v) {
          if (this.treatyType === "QUOTA_SHARE") return v != null;
          return true;
        },
        message: "sharePercentage is required for QUOTA_SHARE treaties"
      }
    },

    retentionLimit: {
      type: Number,
      min: [0, "retentionLimit cannot be negative"],
      // Required for SURPLUS; optional for QUOTA_SHARE
      validate: {
        validator: function (v) {
          if (this.treatyType === "SURPLUS") return v != null;
          return true;
        },
        message: "retentionLimit is required for SURPLUS treaties"
      }
    },

    treatyLimit: {
      type: Number,
      min: [0, "treatyLimit cannot be negative"],
      required: true
    },

    applicableLOBs: {
      type: [String],
      enum: LOBS,
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "applicableLOBs must contain at least one LOB"
      },
      index: true
    },

    effectiveFrom: {
      type: Date,
      required: true
    },

    effectiveTo: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          if (!v || !this.effectiveFrom) return true;
          return v > this.effectiveFrom;
        },
        message: "effectiveTo must be after effectiveFrom"
      }
    },

    status: {
      type: String,
      enum: TREATY_STATUSES,
      default: "ACTIVE",
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Common filters: validity & reinsurer
TreatySchema.index({ reinsurerId: 1, status: 1 });
TreatySchema.index({ effectiveFrom: 1, effectiveTo: 1 });

module.exports = model('Treaty', TreatySchema);
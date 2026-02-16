// models/risk-allocation.model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const AllocationSubSchema = new Schema(
  {
    reinsurerId: {
      type: Schema.Types.ObjectId,
      ref: "Reinsurer",
      required: true
    },
    treatyId: {
      type: Schema.Types.ObjectId,
      ref: "Treaty",
      required: true
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: [0, "allocatedAmount cannot be negative"]
    },
    allocatedPercentage: {
      type: Number,
      required: true,
      min: [0, "allocatedPercentage cannot be negative"],
      max: [100, "allocatedPercentage cannot exceed 100"]
    }
  },
  { _id: false }
);

const RiskAllocationSchema = new Schema({
    _id: ObjectId,
    policyId: {
      type: Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
      index: true
    },

    allocations: {
      type: [AllocationSubSchema],
      validate: {
        validator: function (arr) {
          if (!Array.isArray(arr) || arr.length === 0) return true; // allow empty if fully retained
          // optional: check percentages sum <= 100
          const totalPct = arr.reduce((s, a) => s + (a.allocatedPercentage || 0), 0);
          return totalPct <= 100 + 1e-9; // tolerance
        },
        message: "Total allocatedPercentage across allocations must be ≤ 100"
      }
    },

    retainedAmount: {
      type: Number,
      required: true,
      min: [0, "retainedAmount cannot be negative"]
    },

    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    calculatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

// Helpful for history queries per policy
RiskAllocationSchema.index({ policyId: 1, calculatedAt: -1 });

module.exports = model('RiskAllocation', RiskAllocationSchema);
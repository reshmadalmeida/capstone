const mongoose = require("mongoose");

const { Schema } = mongoose;

// Subdocument schema for each allocation entry
const AllocationSchema = new Schema(
  {
    reinsurerId: {
      type: Schema.Types.ObjectId,
      ref: "Reinsurer",
      required: true,
    },
    treatyId: {
      type: Schema.Types.ObjectId,
      ref: "Treaty",
      required: true,
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    allocatedPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false },
);

const RiskAllocationSchema = new Schema(
  {
    policyId: {
      type: Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },

    allocations: {
      type: [AllocationSchema],
      default: [],
    },

    retainedAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    calculatedAt: {
      type: Date,
      default: new Date(),
    },

    calculatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "risk_allocations",
  },
);

module.exports = mongoose.model("RiskAllocation", RiskAllocationSchema);

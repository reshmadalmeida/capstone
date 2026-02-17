const mongoose = require("mongoose");

const { Schema } = mongoose;

const ClaimSchema = new Schema(
  {
    claimNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    policyId: {
      type: Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },

    claimAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    approvedAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["IN_REVIEW", "APPROVED", "REJECTED", "SETTLED"],
      default: "IN_REVIEW",
    },

    incidentDate: {
      type: Date,
      required: true,
    },

    reportedDate: {
      type: Date,
      required: true,
      default: new Date(),
    },

    handledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "claims",
  },
);

module.exports = mongoose.model("Claim", ClaimSchema);

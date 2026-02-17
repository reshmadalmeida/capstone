const mongoose = require("mongoose");

const { Schema } = mongoose;

const PolicySchema = new Schema(
  {
    policyNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    insuredName: {
      type: String,
      required: true,
      trim: true,
    },

    insuredType: {
      type: String,
      required: true,
      enum: ["INDIVIDUAL", "CORPORATE"],
    },

    lineOfBusiness: {
      type: String,
      required: true,
      enum: ["HEALTH", "MOTOR", "LIFE", "PROPERTY"],
    },

    sumInsured: {
      type: Number,
      required: true,
      min: 0,
    },

    premium: {
      type: Number,
      required: true,
      min: 0,
    },

    retentionLimit: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "EXPIRED"],
      default: "DRAFT",
    },

    effectiveFrom: {
      type: Date,
      required: true,
    },

    effectiveTo: {
      type: Date,
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    approvedBy: {
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
    collection: "policies",
  },
);

module.exports = mongoose.model("Policy", PolicySchema);

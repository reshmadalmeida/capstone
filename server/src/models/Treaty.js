const mongoose = require("mongoose");

const { Schema } = mongoose;

const TreatySchema = new Schema(
  {
    treatyName: {
      type: String,
      required: true,
      trim: true,
    },

    treatyType: {
      type: String,
      required: true,
      enum: ["QUOTA_SHARE", "SURPLUS"],
    },

    reinsurerId: {
      type: Schema.Types.ObjectId,
      ref: "Reinsurer",
      required: true,
    },

    sharePercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: function () {
        return this.treatyType === "QUOTA_SHARE";
      },
    },

    retentionLimit: {
      type: Number,
      min: 0,
      required: function () {
        return this.treatyType === "SURPLUS";
      },
    },

    treatyLimit: {
      type: Number,
      min: 0,
      required: true,
    },

    applicableLOBs: [
      {
        type: String,
        enum: ["HEALTH", "MOTOR", "LIFE", "PROPERTY"],
        required: true,
      },
    ],

    effectiveFrom: {
      type: Date,
      required: true,
    },

    effectiveTo: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    collection: "treaties",
  },
);

module.exports = mongoose.model("Treaty", TreatySchema);

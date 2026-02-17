const mongoose = require("mongoose");

const { Schema } = mongoose;

const ReinsurerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: String,
      enum: ["AAA", "AA", "A", "BBB"],
      required: true,
    },

    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "reinsurers",
  },
);

module.exports = mongoose.model("Reinsurer", ReinsurerSchema);

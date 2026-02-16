// models/reinsurer.model.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const RATINGS = ["AAA", "AA", "A", "BBB"];
const STATUSES = ["ACTIVE", "INACTIVE"];

const ReinsurerSchema = new Schema({
    _id: ObjectId,
    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },

    country: {
      type: String,
      required: true,
      trim: true
    },

    rating: {
      type: String,
      enum: RATINGS,
      required: true
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid contactEmail format"
      }
    },

    status: {
      type: String,
      enum: STATUSES,
      default: "ACTIVE",
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Helpful indexes
ReinsurerSchema.index({ rating: 1, status: 1 });

module.exports = model('Reinsurer', ReinsurerSchema);
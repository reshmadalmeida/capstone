const mongoose = require('mongoose');
const CLAIM_STATUSES = ["SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "SETTLED"];
const { Schema } = mongoose;

const claimsSchema = new mongoose.Schema({
    _id: ObjectId,
    claimNumber: {
        type: String,
        unique: true,
        index: true,
        // If you plan to auto-generate, keep required: false and fill in a pre-validate hook
        required: true,
        immutable: true,
        trim: true
    },

    policyId: {
        type: Schema.Types.ObjectId,
        ref: "Policy",
        required: true,
        index: true
    },
    claimAmount: {
        type: Number,
        required: true,
        min: [0, "claimAmount cannot be negative"]
    },

    approvedAmount: {
        type: Number,
        min: [0, "approvedAmount cannot be negative"],
        //check this 
        validate: {
            validator: function (v) {
                // allow undefined; if present, must be <= claimAmount
                if (v == null) return true;
                if (typeof this.claimAmount !== 'number') return true;
                return v <= this.claimAmount;
            },
            message: "approvedAmount cannot exceed claimAmount"
        }
    },
    status: {
        type: String, enums: CLAIM_STATUSES, required: true, default: "SUBMITTED",
        index: true
    },
    incidentDate: {
        type: Date,
        required: true
    },
    reportedDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                if (!v || !this.incidentDate) return true;
                return v >= this.incidentDate;
            },
            message: "reportedDate must be on or after incidentDate"
        }
    },

    handledBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    remarks: String,
    createdAt: Date,
    updatedAt: Date
}, {
    versionKey: false
})
module.exports = mongoose.model("Claim", claimsSchema)



// src/models/sponsorship.model.js
import mongoose from "mongoose";

const sponsorshipSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    businessType: { type: String, required: true },
    ownerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    permanentAddress: { type: String, required: true },

    sponsorshipCategory: {
      type: String,
      enum: ["associate", "event", "other"],
      required: true,
    },

    amount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Sponsorship = mongoose.model("Sponsorship", sponsorshipSchema);

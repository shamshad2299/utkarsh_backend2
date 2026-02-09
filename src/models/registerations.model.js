// src/models/registerations.model.js
import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      index: true,
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    formData: mongoose.Schema.Types.Mixed,

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "waitlisted", "cancelled"],
      default: "confirmed",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true,
    },

    checkedIn: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

registrationSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

registrationSchema.index(
  { eventId: 1, teamId: 1 },
  { unique: true, partialFilterExpression: { teamId: { $exists: true } } }
);

export const Registration = mongoose.model("Registration", registrationSchema);

// src/models/results.model.js
import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      index: true,
    },

    position: { type: Number, required: true },
  },
  { timestamps: true }
);

resultSchema.index({ eventId: 1, position: 1 }, { unique: true });
resultSchema.index(
  { eventId: 1, registrationId: 1 },
  { unique: true }
);

export const Result = mongoose.model("Result", resultSchema);

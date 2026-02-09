import mongoose from "mongoose";

const sponsorshipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    organization: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    sponsorshipType: { type: String, default: "" }, // Gold/Silver/Title etc
    amount: { type: Number, default: 0 },

    message: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Sponsorship = mongoose.model("Sponsorship", sponsorshipSchema);

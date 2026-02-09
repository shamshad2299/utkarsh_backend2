// src/models/admin.model.js
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
    },

    password: { type: String, required: true, minlength: 6 },

    permissions: { type: [String], default: [] },

    adminStatus: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "pending",
    },

    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

export default mongoose.models.Admin ||
  mongoose.model("Admin", AdminSchema);

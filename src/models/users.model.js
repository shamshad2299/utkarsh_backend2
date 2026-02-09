// src/models/users.model.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    mobile_no: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    college: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },

    role: {
      type: String,
      enum: ["user"],
      default: "user",
      index: true,
    },

    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },

    refreshToken: { type: String, select: false },
    resetPasswordCode: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model("User", userSchema);

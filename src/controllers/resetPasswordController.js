// src/controllers/resetPasswordController.js
import crypto from "crypto";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";
import { resetPasswordTemplate } from "../services/requestPasswordTemplete.js";

/* ================= REQUEST PASSWORD RESET ================= */
export const requestPasswordReset = async (req, res) => {
  const { identifier } = req.body || {};

  if (!identifier) {
    throw new ApiError(400, "Email or UserId required");
  }

  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { userId: identifier },
    ],
    isDeleted: false,
  });

  // user check if present or not 
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If user exists, verification code sent",
    });
  }

  // generate 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.resetPasswordCode = hashedCode;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

  await user.save({ validateBeforeSave: false });

  // 📧 TODO: replace with email service
 await sendEmail({
    to: user.email,
    subject: "Password Reset OTP | BBD UTKARSH 2026",
    html: resetPasswordTemplate({
      name: user.name,
      otp: resetCode,
      expiryMinutes: 10,
    }),
  });

  res.status(200).json({
    success: true,
    message: "If user exists, verification code sent",
  });
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  const { identifier, code, newPassword } = req.body || {};

  if (!identifier || !code || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  const hashedCode = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { userId: identifier },
    ],
    resetPasswordCode: hashedCode,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordCode +resetPasswordExpire");

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  // set new password 
  user.password = newPassword;

  // cleanup reset fields
  user.resetPasswordCode = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshToken = null; // logout all sessions

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
};

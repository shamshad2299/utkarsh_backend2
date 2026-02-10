// src/controllers/resetPasswordController.js
import crypto from "crypto";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { resetPasswordTemplate } from "../services/requestPasswordTemplete.js";

/* ================= REQUEST PASSWORD RESET ================= */
import { sendEmailBrevo} from "../utils/sendEmail.js";

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

  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If user exists, verification code sent",
    });
  }

  // ⛔ soft rate-limit
  if (
    user.resetPasswordExpire &&
    user.resetPasswordExpire > Date.now() - 2 * 60 * 1000
  ) {
    return res.status(429).json({
      success: false,
      message: "Please wait before requesting another OTP",
    });
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES) || 10;

  user.resetPasswordCode = hashedCode;
  user.resetPasswordExpire =
    Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmailBrevo({
      to: user.email,
      subject: "Password Reset OTP | BBD UTKARSH 2026",
      html: resetPasswordTemplate({
        name: user.name,
        otp: resetCode,
        expiryMinutes: OTP_EXPIRE_MINUTES,
      }),
    });
  } catch (err) {
    console.error("Brevo OTP email failed:", err.message);
  }

  return res.status(200).json({
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

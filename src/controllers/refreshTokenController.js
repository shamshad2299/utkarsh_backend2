// src/controllers/refreshTokenController.js
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import Admin from "../models/admin.model.js";
import { generateAccessToken } from "./userController.js";
import { generateAdminAccessToken } from "./adminController.js";
import { ApiError } from "../utils/ApiError.js";

/* ================= USER REFRESH TOKEN ================= */
export const refreshUserAccessToken = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");

  if (!user || user.refreshToken !== token) {
    throw new ApiError(403, "Invalid refresh token");
  }

  if (user.isDeleted) {
    throw new ApiError(401, "User account not found");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "User account is blocked");
  }

  const newAccessToken = generateAccessToken(user);

  res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
};

/* ================= ADMIN REFRESH TOKEN ================= */
export const refreshAdminAccessToken = async (req, res) => {
  const token = req.cookies?.adminRefreshToken;

  if (!token) {
    throw new ApiError(401, "Admin refresh token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET_ADMIN
    );
  } catch {
    throw new ApiError(401, "Invalid or expired admin refresh token");
  }

  // 🔥 FIX HERE
  const admin = await Admin.findById(decoded.id).select("+refreshToken");

  if (!admin || admin.refreshToken !== token) {
    throw new ApiError(403, "Invalid refresh token");
  }

  if (admin.adminStatus !== "active") {
    throw new ApiError(403, "Admin access not active");
  }

  const newAccessToken = generateAdminAccessToken(admin);

  res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
};

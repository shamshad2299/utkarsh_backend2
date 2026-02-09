// src/routes/userRoutes.js
import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  updateMyProfile,
  updateUser,
} from "../controllers/userController.js";
import { refreshUserAccessToken } from "../controllers/refreshTokenController.js";
import {
  requestPasswordReset,
  resetPassword,
} from "../controllers/resetPasswordController.js";
import adminAuth from "../middlewares/adminAuth.js";
import { verifyJWT } from "../middlewares/authMiddleWare.js";
import {
  deleteUser,
  getUserById,
} from "../controllers/adminUser.controller.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

/* ================= AUTH / PUBLIC ================= */

router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/refresh-token", asyncHandler(refreshUserAccessToken));

router.post(
  "/request-pass-reset-otp",
  asyncHandler(requestPasswordReset)
);
router.post("/reset-password", asyncHandler(resetPassword));

/* ================= USER (AUTH REQUIRED) ================= */

router.post("/logout", verifyJWT, asyncHandler(logoutUser));
router.patch("/me", verifyJWT, asyncHandler(updateMyProfile));

/* ================= ADMIN ================= */

// static prefix first
router.get(
  "/users/:id",
  adminAuth,
  asyncHandler(getUserById)
);

router.put(
  "/update/users/:id",
  adminAuth,
  asyncHandler(updateUser)
);

// generic dynamic LAST
router.delete(
  "/:id",
  adminAuth,
  asyncHandler(deleteUser)
);

export default router;

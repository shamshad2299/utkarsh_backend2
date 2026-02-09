// src/routes/registrationRoutes.js
import express from "express";
import {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  restoreRegistration,
} from "../controllers/registrationController.js";
import { verifyJWT } from "../middlewares/authMiddleWare.js";
import adminAuth from "../middlewares/adminAuth.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

/* ================= REGISTRATION ================= */

// ================= STATIC ROUTES FIRST =================

// Get my registrations (User)
router.get("/my", verifyJWT, asyncHandler(getMyRegistrations));

// Admin → get registrations for event
router.get(
  "/event/:eventId",
  adminAuth,
  asyncHandler(getEventRegistrations)
);

// ================= ACTION ROUTES =================

// Register for event (User)
router.post("/", verifyJWT, asyncHandler(registerForEvent));

// Cancel registration (User)
// more specific dynamic route before generic ones
router.patch(
  "/:id/cancel",
  verifyJWT,
  asyncHandler(cancelRegistration)
);
router.patch("/registrations/:id/restore" , verifyJWT , asyncHandler(restoreRegistration));

export default router;

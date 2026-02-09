// src/routes/resultRoutes.js
import express from "express";
import {
  addResult,
  getResultsByEvent,
  lockResults,
  deleteResult,
} from "../controllers/resultController.js";
import adminAuth from "../middlewares/adminAuth.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

/* ================= RESULTS ================= */

// ================= STATIC / PREFIX ROUTES FIRST =================

// Get results by event (Public)
router.get(
  "/event/:eventId",
  asyncHandler(getResultsByEvent)
);

// Lock results for an event (Admin)
// more specific than above → comes after or before safely
router.patch(
  "/event/:eventId/lock",
  adminAuth,
  asyncHandler(lockResults)
);

// ================= GENERIC ROUTES =================

// Add result (Admin)
router.post(
  "/",
  adminAuth,
  asyncHandler(addResult)
);

// Delete result by id (Admin)
// generic dynamic route LAST
router.delete(
  "/:id",
  adminAuth,
  asyncHandler(deleteResult)
);

export default router;

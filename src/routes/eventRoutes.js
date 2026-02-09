// src/routes/eventRoutes.js
import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
} from "../controllers/eventController.js";
import adminAuth from "../middlewares/adminAuth.js";
import { upload } from "../middlewares/upload.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

/* ================= EVENTS ================= */

// ✅ Get all events (Public)
router.get("/", asyncHandler(getAllEvents));

// ✅ Get events by category (STATIC prefix)
router.get(
  "/category/:categoryId",
  asyncHandler(getEventsByCategory)
);

// ✅ Get event by id (DYNAMIC LAST)
router.get("/:id", asyncHandler(getEventById));

// ✅ Create event (Admin)
router.post(
  "/",
  adminAuth,
  upload.array("images", 5),
  asyncHandler(createEvent)
);

// ✅ Update event (Admin)
router.put(
  "/:id",
  adminAuth,
  upload.array("images", 5),
  asyncHandler(updateEvent)
);

// ✅ Delete event (Admin)
router.delete(
  "/:id",
  adminAuth,
  asyncHandler(deleteEvent)
);

export default router;

// src/routes/auditLogRoutes.js
import express from "express";
import {
  getAuditLogs,
  getAuditLogsByTarget,
} from "../controllers/auditLogController.js";
import adminAuth from "../middlewares/adminAuth.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

/* ================= AUDIT LOGS (ADMIN ONLY) ================= */

// ✅ STATIC route first
// GET /api/audit-logs?collection=users&id=...
router.get("/", adminAuth, asyncHandler(getAuditLogs));

// ✅ DYNAMIC route LAST
// GET /api/audit-logs/:collection/:id
router.get(
  "/:collection/:id",
  adminAuth,
  asyncHandler(getAuditLogsByTarget)
);

export default router;

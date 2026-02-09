import express from "express";
import {
  createTeam,
  addTeamMember,
  removeTeamMember,
  getMyTeams,
  getTeamById,
  deleteTeam,
} from "../controllers/teamController.js";
import { verifyJWT } from "../middlewares/authMiddleWare.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

/* ================= TEAMS ================= */

// ================= STATIC ROUTES FIRST =================

// My teams
router.get("/my", verifyJWT, asyncHandler(getMyTeams));

// ================= ACTION / NESTED ROUTES =================

// Add member (leader only)
router.post(
  "/:teamId/members",
  verifyJWT,
  asyncHandler(addTeamMember)
);

// Remove member (leader only)
router.delete(
  "/:teamId/members/:memberId",
  verifyJWT,
  asyncHandler(removeTeamMember)
);

// ================= GENERIC ROUTES LAST =================

// Create team
router.post("/", verifyJWT, asyncHandler(createTeam));

// Get team by id
router.get("/:id", verifyJWT, asyncHandler(getTeamById));

// Delete team (leader only)
router.delete("/:id", verifyJWT, asyncHandler(deleteTeam));

export default router;

import express from "express";
import {
  createSponsorship,
  getMySponsorships,
  getAllSponsorships,
  updateSponsorshipStatus,
  deleteSponsorship,
} from "../controllers/sponsorshipController.js";

import { verifyJWT } from "../middlewares/authMiddleWare.js";
import adminAuth from "../middlewares/adminAuth.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

router.post("/", asyncHandler(createSponsorship));

router.get("/my", verifyJWT, asyncHandler(getMySponsorships));

router.get("/", adminAuth, asyncHandler(getAllSponsorships));

router.patch("/:id/status", adminAuth, asyncHandler(updateSponsorshipStatus));

router.delete("/:id", adminAuth, asyncHandler(deleteSponsorship));

export default router;

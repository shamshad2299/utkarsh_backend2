import express from "express";
import adminAuth from "../middlewares/adminAuth.js";
import { upload } from "../middlewares/upload.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

import {
  addWebsiteTeamMember,
  getWebsiteTeamMembers,
  deleteWebsiteTeamMember,
  toggleWebsiteTeamMember,
} from "../controllers/websiteTeamController.js";

const router = express.Router();

/* PUBLIC */
router.get("/", asyncHandler(getWebsiteTeamMembers));

/* ADMIN */
router.post(
  "/",
  adminAuth,
  upload.single("image"),
  asyncHandler(addWebsiteTeamMember)
);

router.delete("/:id", adminAuth, asyncHandler(deleteWebsiteTeamMember));
router.patch("/:id/toggle", adminAuth, asyncHandler(toggleWebsiteTeamMember));

export default router;

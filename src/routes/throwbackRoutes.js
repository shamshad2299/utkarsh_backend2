import express from "express";
import adminAuth from "../middlewares/adminAuth.js";
import { upload } from "../middlewares/upload.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

import {
  uploadThrowback,
  getThrowbacks,
  deleteThrowback,
} from "../controllers/throwbackController.js";

const router = express.Router();

/* PUBLIC */
router.get("/", asyncHandler(getThrowbacks));

/* ADMIN */
router.post(
  "/",
  adminAuth,
  upload.single("image"),
  asyncHandler(uploadThrowback)
);

router.delete("/:id", adminAuth, asyncHandler(deleteThrowback));

export default router;

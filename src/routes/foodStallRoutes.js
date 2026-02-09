import express from "express";
import {
  createFoodStall,
  getAllFoodStalls,
  updateFoodStallStatus,
  deleteFoodStall,
} from "../controllers/foodStallController.js";

import adminAuth from "../middlewares/adminAuth.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

router.post("/", asyncHandler(createFoodStall));

router.get("/", adminAuth, asyncHandler(getAllFoodStalls));

router.patch("/:id/status", adminAuth, asyncHandler(updateFoodStallStatus));

router.delete("/:id", adminAuth, asyncHandler(deleteFoodStall));

export default router;

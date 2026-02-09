// src/routes/categoryRoutes.js
import express from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import adminAuth from "../middlewares/adminAuth.js";
import { upload } from "../middlewares/upload.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

/* =======================
   CREATE
======================= */
router.post(
  "/add",
  adminAuth,
  upload.single("image"),
  asyncHandler(addCategory)
);

/* =======================
   READ (STATIC FIRST)
======================= */

// ✅ Get all categories
router.get("/get", asyncHandler(getAllCategories));

// ✅ Get category by id (explicit)
router.get("/get/:id", asyncHandler(getCategoryById));

/* =======================
   UPDATE
======================= */
router.put(
  "/update/:id",
  adminAuth,
  upload.single("image"),
  asyncHandler(updateCategory)
);

/* =======================
   DELETE
======================= */
router.delete(
  "/delete/:id",
  adminAuth,
  asyncHandler(deleteCategory)
);

/* =======================
   ❗ DYNAMIC ROUTE LAST
======================= */

// ⚠️ This must be LAST
router.get("/:id", asyncHandler(getCategoryById));

export default router;

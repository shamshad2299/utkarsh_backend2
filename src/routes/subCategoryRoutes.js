// src/routes/subCategoryRoutes.js
import express from "express";
import {
  addSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  getSubCategoryByCategory,
  getSubCategoryById,
  updateSubCategory,
} from "../controllers/subEventCategoryController.js";
import adminAuth from "../middlewares/adminAuth.js";
import { asyncHandler } from "../middlewares/asyncErrorHandlerMiddleWare.js";

const router = express.Router();

/* =========================== SubCategory =========================== */

// ================= STATIC ROUTES FIRST =================

// Create subcategory
router.post("/add", adminAuth, asyncHandler(addSubCategory));

// Get all subcategories
router.get("/subcategories", asyncHandler(getAllSubCategories));

// Get subcategories by category (static prefix)
router.get(
  "/get-by-categ/:categoryId",
  adminAuth,
  asyncHandler(getSubCategoryByCategory)
);

// Get subcategory by id (specific static prefix)
router.get(
  "/subcategories/:id",
  asyncHandler(getSubCategoryById)
);

// ================= GENERIC DYNAMIC ROUTES LAST =================

// Update subcategory
router.patch(
  "/:id",
  adminAuth,
  asyncHandler(updateSubCategory)
);

// Delete subcategory
router.delete(
  "/:id",
  adminAuth,
  asyncHandler(deleteSubCategory)
);

export default router;

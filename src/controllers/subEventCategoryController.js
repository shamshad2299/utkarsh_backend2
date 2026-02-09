// src/controllers/subEventCategoryController.js
import SubCategory from "../models/subEvent.model.js";
import Category from "../models/eventCategory.model.js";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError.js";

/* ================= ADD SUB CATEGORY ================= */
export const addSubCategory = async (req, res) => {
  const { title, category, description } = req.body;

  if (!title || !category) {
    throw new ApiError(400, "Title and category are required");
  }

  // check parent category
  const parentCategory = await Category.findById(category);
  if (!parentCategory) {
    throw new ApiError(404, "Parent category not found");
  }

  const slug = slugify(title, { lower: true, strict: true });

  try {
    const subCategory = await SubCategory.create({
      title,
      slug,
      category,
      description,
    });

    res.status(201).json({
      success: true,
      message: "SubCategory added successfully",
      data: subCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        400,
        "SubCategory with same title already exists in this category",
      );
    }
    throw error;
  }
};

/* ================= DELETE SUB CATEGORY ================= */
export const deleteSubCategory = async (req, res) => {
  const { id } = req.params;

  const subCategory = await SubCategory.findByIdAndDelete(id);
  if (!subCategory) {
    throw new ApiError(404, "SubCategory not found");
  }

  res.status(200).json({
    success: true,
    message: "SubCategory deleted successfully",
  });
};


/* ================= GET ALL SUB CATEGORIES ================= */
export const getAllSubCategories = async (req, res) => {
  const subCategories = await SubCategory.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: subCategories.length,
    data: subCategories,
  });
};

/* ================= GET SUB CATEGORY BY ID ================= */
export const getSubCategoryById = async (req, res) => {
  const { id } = req.params;

  const subCategory = await SubCategory.findById(id)
    .populate("category", "name slug");

  if (!subCategory) {
    throw new ApiError(404, "SubCategory not found");
  }

  res.status(200).json({
    success: true,
    data: subCategory,
  });
};

/* ================= GET SUB CATEGORIES BY CATEGORY ================= */
export const getSubCategoryByCategory = async (req, res) => {
  const { categoryId } = req.params;

  const subCategories = await SubCategory.find({ category: categoryId })
    .populate("category", "title slug")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: subCategories.length,
    data: subCategories,
  });
};

/* ================= UPDATE SUB CATEGORY ================= */
export const updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const subCategory = await SubCategory.findById(id);
  if (!subCategory) {
    throw new ApiError(404, "SubCategory not found");
  }

  if (title) {
    subCategory.title = title;
    subCategory.slug = slugify(title, { lower: true, strict: true });
  }

  if (description !== undefined) {
    subCategory.description = description;
  }

  try {
    await subCategory.save();

    res.status(200).json({
      success: true,
      message: "SubCategory updated successfully",
      data: subCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        400,
        "SubCategory with same title already exists",
      );
    }
    throw error;
  }
};

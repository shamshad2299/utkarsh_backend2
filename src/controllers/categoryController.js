// src/controllers/categoryController.js
import Category from "../models/eventCategory.model.js";
import cloudinary from "../utils/cloudinary.js";
import slugify from "slugify";
import { ApiError } from "../utils/ApiError.js";
import { removeLocalFile } from "../utils/removeLocalFile.js";
import path from "path";
import { logAudit } from "../utils/auditLogger.js";

/* ================= ADD CATEGORY ================= */
export const addCategory = async (req, res) => {
  const { name, description, rules } = req.body;

  if (!name) throw new ApiError(400, "Category name is required");

  const existing = await Category.findOne({ name });
  if (existing) throw new ApiError(400, "Category already exists");

  const slug = slugify(name, { lower: true, strict: true });

  let image = null;

  // image handling
  if (req.file) {
    const absolutePath = path.resolve(req.file.path);

    try {
      const result = await cloudinary.uploader.upload(absolutePath, {
        folder: "categories",
        resource_type: "image",
        timeout: 60000,
      });

      image = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } finally {
      removeLocalFile(absolutePath);
    }
  }

  const category = await Category.create({
    name,
    description,
    rules,
    slug,
    image,
  });

  // AUDIT LOG
  await logAudit({
    req,
    action: "CATEGORY_CREATED",
    targetCollection: "Category",
    targetId: category._id,
    newData: category,
  });
 

  res.status(201).json({
    success: true,
    message: "Category added successfully",
    data: category,
  });
};

/* ================= GET ALL CATEGORIES ================= */
export const getAllCategories = async (req, res) => {
  const categories = await Category.find()
    .sort({ createdAt: -1 })
    .select("name description rules image slug");

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
};

/* ================= GET CATEGORY BY ID ================= */
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json({
    success: true,
    data: category,
  });
};

/* ================= UPDATE CATEGORY ================= */
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, rules } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // capture old state for audit
  const oldData = category.toObject();

  // replace image if new image provided
  if (req.file) {
    // delete old image from cloudinary
    if (category.image?.publicId) {
      await cloudinary.uploader.destroy(category.image.publicId);
    }

    const absolutePath = path.resolve(req.file.path);

    const result = await cloudinary.uploader.upload(absolutePath, {
      folder: "categories",
      resource_type: "image",
    });

    category.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    removeLocalFile(absolutePath);
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true, strict: true });
  }

  if (description !== undefined) category.description = description;
  if (rules !== undefined) category.rules = rules;

  await category.save();

  // AUDIT LOG
  await logAudit({
    req,
    action: "CATEGORY_UPDATED",
    targetCollection: "Category",
    targetId: category._id,
    oldData,
    newData: category,
  });

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
};


/* ================= DELETE CATEGORY ================= */
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // capture old state
  const oldData = category.toObject();

  // delete image from cloudinary
  if (category.image?.publicId) {
    await cloudinary.uploader.destroy(category.image.publicId);
  }

  await category.deleteOne();

  // AUDIT LOG
  await logAudit({
    req,
    action: "CATEGORY_DELETED",
    targetCollection: "Category",
    targetId: category._id,
    oldData,
  });

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
};


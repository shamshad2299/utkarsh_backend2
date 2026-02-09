// src/controllers/eventController.js
import { Event } from "../models/events.model.js";
import Category from "../models/eventCategory.model.js";
import SubCategory from "../models/subEvent.model.js";
import cloudinary from "../utils/cloudinary.js";
import { removeLocalFile } from "../utils/removeLocalFile.js";
import { ApiError } from "../utils/ApiError.js";
import { logAudit } from "../utils/auditLogger.js";

/* ================= CREATE EVENT (ADMIN) ================= */
export const createEvent = async (req, res) => {
  const {
    title,
    category,
    subCategory,
    description,
    venueName,
    startTime,
    endTime,
    registrationDeadline,
    capacity,
    fee,
    event_rule,
    eventType,
    teamSize,
  } = req.body;

  if (
    !title ||
    !category ||
    !subCategory ||
    !description ||
    !venueName ||
    !startTime ||
    !endTime ||
    !event_rule,
    !registrationDeadline ||
    !capacity ||
    !eventType
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) throw new ApiError(404, "Category not found");

  const subCategoryExists = await SubCategory.findById(subCategory);
  if (!subCategoryExists) throw new ApiError(404, "SubCategory not found");

  let images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "events",
      });

      images.push({
        url: result.secure_url,
        publicId: result.public_id,
      });

      removeLocalFile(file.path);
    }
  }

  const event = await Event.create({
    title,
    category,
    subCategory,
    description,
    venueName,
    startTime,
    endTime,
    registrationDeadline,
    capacity,
    fee,
    images,
    eventType,
    teamSize: teamSize || { min: 1, max: 1 },
    createdBy: req.admin._id,
  });

  // AUDIT LOG
  await logAudit({
    req,
    action: "EVENT_CREATED",
    targetCollection: "Event",
    targetId: event._id,
    newData: event,
  });

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: event,
  });
};

/* ================= GET ALL EVENTS ================= */
export const getAllEvents = async (req, res) => {
  const events = await Event.find({ isDeleted: false })
    .populate("category", "name slug")
    .populate("subCategory", "title slug")
    .sort({ startTime: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
};

/* ================= GET EVENT BY ID ================= */
export const getEventById = async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate("category", "name slug")
    .populate("subCategory", "title slug");

   
  if (!event || event.isDeleted) {
    throw new ApiError(404, "Either event Deleted or Event not found");
  }

  res.status(200).json({
    success: true,
    data: event,
  });
};

/* ================= UPDATE EVENT (ADMIN) ================= */
export const updateEvent = async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event || event.isDeleted) {
    throw new ApiError(404, "Event not found");
  }

  // capture old state
  const oldData = event.toObject();

  const allowedFields = [
    "title",
    "description",
    "venueName",
    "startTime",
    "endTime",
    "registrationDeadline",
    "capacity",
    "fee",
    "eventType",
    "teamSize",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === "teamSize") {
        // 🔥 FIX: parse if string
        event.teamSize =
          typeof req.body.teamSize === "string"
            ? JSON.parse(req.body.teamSize)
            : req.body.teamSize;
      } else {
        event[field] = req.body[field];
      }
    }
  }

  if (req.files && req.files.length > 0) {
    for (const img of event.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    const images = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "events",
      });

      images.push({
        url: result.secure_url,
        publicId: result.public_id,
      });

      removeLocalFile(file.path);
    }

    event.images = images;
  }

  await event.save();

  // AUDIT LOG
  await logAudit({
    req,
    action: "EVENT_UPDATED",
    targetCollection: "Event",
    targetId: event._id,
    oldData,
    newData: event,
  });

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: event,
  });
};

/* ================= DELETE EVENT (ADMIN – SOFT DELETE) ================= */
export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event || event.isDeleted) {
    throw new ApiError(404, "Event not found");
  }

  // capture old state
  const oldData = event.toObject();

  event.isDeleted = true;
  await event.save();

  // AUDIT LOG
  await logAudit({
    req,
    action: "EVENT_DELETED",
    targetCollection: "Event",
    targetId: event._id,
    oldData,
    newData: event,
  });

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
};
/* ================= GET EVENTS BY CATEGORY ================= */
export const getEventsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  // ❌ strict validation removed
  const categoryExists = await Category.findById(categoryId);

  // sirf warning, error nahi
  if (!categoryExists) {
    console.warn(
      `Category deleted but events requested. CategoryId: ${categoryId}`
    );
  }

  const events = await Event.find({
    category: categoryId,
    isDeleted: false,
  })
    .populate("category", "name slug")
    .populate("subCategory", "title slug")
    .sort({ startTime: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
    categoryDeleted: !categoryExists, // 👈 frontend ke liye useful
  });
};



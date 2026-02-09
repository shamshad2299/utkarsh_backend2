// src/controllers/adminUser.controller.js
import mongoose from "mongoose";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logAudit } from "../utils/auditLogger.js";
import { Registration } from "../models/registerations.model.js";

/* ================= GET USERS (WITH FILTERS) ================= */
export const getUsers = async (req, res) => {
  const { search, active, page = 1, limit = 20 } = req.query;

  const filter = { isDeleted: false };

  if (search) { // can search by userid, email, naem
    filter.$or = [
      { userId: search },
      { email: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];
  }

  if (active === "true") filter.isBlocked = false;
  if (active === "false") filter.isBlocked = true;

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  res.status(200).json({
    success: true,
    data: users,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

/* ================= BLOCK / UNBLOCK USER ================= */
export const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { active } = req.body;

  if (typeof active !== "boolean") {
    throw new ApiError(400, "Active status must be boolean");
  }

  // old state data
  const oldUser = await User.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!oldUser) {
    throw new ApiError(404, "User not found or already deleted");
  }

  const oldData = oldUser.toObject();

  // Update
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: !active },
    { new: true },
  ).select("-password -refreshToken -__v");

  // AUDIT LOG
  await logAudit({
    req,
    action: active ? "USER_UNBLOCKED" : "USER_BLOCKED",
    targetCollection: "User",
    targetId: user._id,
    oldData,
    newData: user,
  });

  res.status(200).json({
    success: true,
    message: active ? "User unblocked" : "User blocked",
    data: user,
  });
};

/* ================= UPDATE USER DETAILS (ADMIN) ================= */
export const updateUserDetails = async (req, res) => {
  const { userId } = req.params;

  const allowedUpdates = [
    "name",
    "email",
    "mobile_no",
    "city",
    "gender",
    "college",
    "course",
  ];

  const updates = {};
  for (const field of allowedUpdates) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // old state data
  const oldUser = await User.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!oldUser) {
    throw new ApiError(404, "User not found or already deleted");
  }

  const oldData = oldUser.toObject();

  // Update
  const user = await User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    updates,
    { new: true, runValidators: true },
  ).select("-password -refreshToken -__v");

  // AUDIT LOG
  await logAudit({
    req,
    action: "USER_UPDATED",
    targetCollection: "User",
    targetId: user._id,
    oldData,
    newData: user,
  });

  res.status(200).json({
    success: true,
    message: "User details updated successfully",
    data: user,
  });
};

/* ================= GET USER BY ID (ADMIN) ================= */
export const getUserById = async (req, res) => {
  const { id } = req.params;

  let user;

  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await User.findById(id).select(" -password -refreshToken -__v");
  } else {
    user = await User.findOne({ userId: id }).select(
      "-password -refreshToken -__v",
    );
  }

  if (!user || user.isDeleted) {
    throw new ApiError(404, "User not found");
  }

 
  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
};

/* ================= DELETE USER  ================= */
export const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const user = await User.findById(id).session(session);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.isDeleted) {
      throw new ApiError(400, "User already deleted");
    }

    const oldData = user.toObject();

    user.isDeleted = true;
    await user.save({ session });

    // AUDIT LOG 
    await logAudit({
      req,
      action: "USER_DELETED",
      targetCollection: "User",
      targetId: user._id,
      oldData,
      newData: user,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

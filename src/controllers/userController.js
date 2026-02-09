// src/controllers/userController.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/users.model.js";
import { Counter } from "../models/counter.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { getNextSequence } from "../utils/getNextSequence.js";
import { verifyJWT } from "../middlewares/authMiddleWare.js";



/* ================= REGISTER USER ================= */
export const registerUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      email,
      password,
      mobile_no,
      city,
      gender,
      college,
      course,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !mobile_no ||
      !city ||
      !gender ||
      !college ||
      !course
    ) {
      throw new ApiError(400, "All required fields must be provided");
    }

    if (password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters long");
    }

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      throw new ApiError(409, "User already exists with this email");
    }
    const seq = await getNextSequence("userId", session);
    const paddedSeq = seq.toString().padStart(4, "0");
    const userId = `VSVT26${paddedSeq}`;


    const user = await User.create(
      [
        {
          name,
          email,
          password,
          mobile_no,
          city,
          gender,
          college,
          course,
          userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const safeUser = await User.findById(user[0]._id).select(
      "-password -refreshToken -__v"
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: safeUser,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error; 
  } finally {
    session.endSession();
  }
};

/* ================= GENERATE ACCESS TOKEN USER ================= */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      userId: user.userId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

/* ================= GENERATE REFRESH TOKEN USER ================= */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

/* ================= LOGIN USER ================= */
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    throw new ApiError(400, "Please fill required fields");
  }

  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { mobile_no: identifier },
      { userId: identifier },
    ],
    isDeleted: false,
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isDeleted) {
    throw new ApiError(404, "User account not found");
  }

  if (user.isBlocked) {
    throw new ApiError(
      403,
      "Your account has been blocked, please contact Admin"
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  user.password = undefined;
  user.refreshToken=undefined;

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    user
  });
};

/* ================= LOGOUT USER ================= */
export const logoutUser = async (req, res) => {
  req.user.refreshToken = null;
  await req.user.save({ validateBeforeSave: false });

  res.clearCookie("refreshToken");

  return res.json({
    success: true,
    message: "Logged out"
  });
};

/* ================= GET ALL USER ================= */
export const getAllUsers = async (req, res) => {
  try {
    const { all, city } = req.query;

    // optional filters
    const filter = {};
    if (city) filter.city = city;

    // 🔥 CASE 1: Get ALL users (no pagination)
    if (all === "true") {
      const users = await User.find(filter)
        .select("-password -refreshToken -__v")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "All users fetched successfully",
        data: users,
        meta: {
          total: users.length,
          all: true,
        },
      });
    }

    // 🔥 CASE 2: Paginated users (default)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshToken -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ================= UPDATE USER ================= */
export const updateUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      mobile_no,
      city,
      gender,
      college,
      course,
    } = req.body;

    // check user exists
    const user = await User.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // email duplicate check (if changed)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email }).session(session);
      if (emailExists) {
        await session.abortTransaction();
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // update only provided fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile_no) user.mobile_no = mobile_no;
    if (city) user.city = city;
    if (gender) user.gender = gender;
    if (college) user.college = college;
    if (course) user.course = course;

    // password update (optional)
    if (password) {
      if (password.length < 8) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }
      user.password = password;
    }

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken -__v",
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: safeUser,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Update User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const updateMyProfile = async (req, res) => {
  const allowedFields = [
    "name",
    "mobile_no",
    "gender",
    "city",
    "college",
    "course",
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // ❌ Nothing to update
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -refreshToken -__v");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
};








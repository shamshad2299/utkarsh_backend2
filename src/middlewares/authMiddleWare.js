// src/moddleWares/authMiddleWare.js
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authorization token missing");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken -__v"
    );

    if (!user || user.isDeleted) {
      throw new ApiError(401, "User not found or deleted");
    }

    if (user.isBlocked) {
      throw new ApiError(403, "User account is blocked");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

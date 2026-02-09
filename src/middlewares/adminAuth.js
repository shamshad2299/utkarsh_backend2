// src/middlewares/adminAuth.js
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";

const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check token presence
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization token missing"));
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
  

    // Find admin
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return next(new ApiError(401, "Admin not found"));
    }

    // Check admin status
    if (admin.adminStatus === "blocked") {
      return next(new ApiError(403, "Admin access blocked"));
    }

    if (admin.adminStatus !== "active") {
      return next(new ApiError(403, "Admin access not active"));
    }

    // Attach admin to request
    req.admin = admin;
    next();
    
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired admin token"));
  }
};

export default adminAuth;

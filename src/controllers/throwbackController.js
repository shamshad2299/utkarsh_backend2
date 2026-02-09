import { Throwback } from "../models/throwback.model.js";
import cloudinary from "../utils/cloudinary.js";
import { removeLocalFile } from "../utils/removeLocalFile.js";
import { ApiError } from "../utils/ApiError.js";
import { logAudit } from "../utils/auditLogger.js";

/* ================= ADD THROWBACK ================= */
export const uploadThrowback = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image is required");
  }

  const { title, rank } = req.body;

  if (rank === undefined) {
    throw new ApiError(400, "Rank is required");
  }

  const parsedRank = Number(rank);
  if (Number.isNaN(parsedRank)) {
    throw new ApiError(400, "Rank must be a number");
  }

  const existing = await Throwback.findOne({ rank: parsedRank });
  if (existing) {
    throw new ApiError(409, `Rank ${parsedRank} already exists`);
  }

  const uploadResult = await cloudinary.uploader.upload(req.file.path, {
    folder: "throwbacks",
  });

  removeLocalFile(req.file.path);

  const throwback = await Throwback.create({
    title,
    rank: parsedRank,
    imageUrl: uploadResult.secure_url,
    cloudinaryId: uploadResult.public_id,
    uploadedBy: req.admin._id,
  });

  await logAudit({
    req,
    action: "CREATE",
    targetCollection: "Throwback",
    targetId: throwback._id,
    newData: throwback,
  });

  res.status(201).json({
    success: true,
    message: "Throwback uploaded successfully",
    data: throwback,
  });
};

/* ================= GET THROWBACKS (PUBLIC) ================= */
export const getThrowbacks = async (req, res) => {
  const images = await Throwback.find()
    .sort({ rank: 1 })
    .select("-cloudinaryId");

  res.json({
    success: true,
    data: images,
  });
};

/* ================= DELETE THROWBACK ================= */
export const deleteThrowback = async (req, res) => {
  const throwback = await Throwback.findById(req.params.id);

  if (!throwback) {
    throw new ApiError(404, "Throwback not found");
  }

  await cloudinary.uploader.destroy(throwback.cloudinaryId);
  await Throwback.findByIdAndDelete(req.params.id);

  await logAudit({
    req,
    action: "DELETE",
    targetCollection: "Throwback",
    targetId: throwback._id,
    oldData: throwback,
  });

  res.json({
    success: true,
    message: "Throwback deleted successfully",
  });
};

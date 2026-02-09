import { WebsiteTeam } from "../models/websiteTeam.model.js";
import cloudinary from "../utils/cloudinary.js";
import { removeLocalFile } from "../utils/removeLocalFile.js";
import { ApiError } from "../utils/ApiError.js";
import { logAudit } from "../utils/auditLogger.js";

/* ================= ADD TEAM MEMBER ================= */
export const addWebsiteTeamMember = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Profile image is required");
  }

  const {
    name,
    role,
    college,
    course,
    linkedin,
    portfolio,
    order,
  } = req.body;

  if (!name || !role) {
    throw new ApiError(400, "Name and role are required");
  }

  const uploadResult = await cloudinary.uploader.upload(req.file.path, {
    folder: "website-team",
  });

  removeLocalFile(req.file.path);

  const member = await WebsiteTeam.create({
    name,
    role,
    college,
    course,
    linkedin,
    portfolio,
    order,
    imageUrl: uploadResult.secure_url,
    cloudinaryId: uploadResult.public_id,
    uploadedBy: req.admin._id,
  });

  await logAudit({
    req,
    action: "CREATE",
    targetCollection: "WebsiteTeam",
    targetId: member._id,
    newData: member,
  });

  res.status(201).json({
    success: true,
    message: "Team member added successfully",
    data: member,
  });
};

/* ================= GET TEAM MEMBERS (PUBLIC) ================= */
export const getWebsiteTeamMembers = async (req, res) => {
  const members = await WebsiteTeam.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .select("-cloudinaryId");

  res.json({
    success: true,
    data: members,
  });
};

/* ================= DELETE TEAM MEMBER ================= */
export const deleteWebsiteTeamMember = async (req, res) => {
  const member = await WebsiteTeam.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Team member not found");
  }

  await cloudinary.uploader.destroy(member.cloudinaryId);
  await WebsiteTeam.findByIdAndDelete(req.params.id);

  await logAudit({
    req,
    action: "DELETE",
    targetCollection: "WebsiteTeam",
    targetId: member._id,
    oldData: member,
  });

  res.json({
    success: true,
    message: "Team member deleted successfully",
  });
};

/* ================= TOGGLE TEAM MEMBER ================= */
export const toggleWebsiteTeamMember = async (req, res) => {
  const member = await WebsiteTeam.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Team member not found");
  }

  member.isActive = !member.isActive;
  await member.save();

  await logAudit({
    req,
    action: "UPDATE",
    targetCollection: "WebsiteTeam",
    targetId: member._id,
    newData: { isActive: member.isActive },
  });

  res.json({
    success: true,
    message: "Team member status updated",
    data: member,
  });
};

// src/controllers/teamController.js
import { Team } from "../models/team.model.js";
import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";

/* ================= CREATE TEAM ================= */
export const createTeam = async (req, res) => {
  const { teamName } = req.body;
  const userId = req.user._id;

  if (!teamName) {
    throw new ApiError(400, "Team name is required");
  }

  const existing = await Team.findOne({
    teamName,
    isDeleted: false,
  });

  if (existing) {
    throw new ApiError(409, "Team name already exists");
  }

  const team = await Team.create({
    teamName,
    teamLeader: userId,
    teamMembers: [],
    createdBy: userId,
  });

  res.status(201).json({
    success: true,
    message: "Team created successfully",
    data: team,
  });
};

/* ================= ADD MEMBER TO TEAM ================= */
export const addTeamMember = async (req, res) => {
  const { teamId } = req.params;
  const { userIdentifier } = req.body; // email / userId
  const requesterId = req.user._id;

  if (!userIdentifier) {
    throw new ApiError(400, "User identifier is required");
  }

  const team = await Team.findById(teamId);
  if (!team || team.isDeleted) {
    throw new ApiError(404, "Team not found");
  }

  // only leader can add members
  if (team.teamLeader.toString() !== requesterId.toString()) {
    throw new ApiError(403, "Only team leader can add members");
  }

  const user = await User.findOne({
    $or: [{ email: userIdentifier }, { userId: userIdentifier }],
    isDeleted: false,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (
    team.teamMembers.includes(user._id) ||
    team.teamLeader.toString() === user._id.toString()
  ) {
    throw new ApiError(409, "User already in team");
  }

  team.teamMembers.push(user._id);
  await team.save();

  res.status(200).json({
    success: true,
    message: "Member added successfully",
    data: team,
  });
};

/* ================= REMOVE TEAM MEMBER ================= */
export const removeTeamMember = async (req, res) => {
  const { teamId, memberId } = req.params;
  const requesterId = req.user._id;

  const team = await Team.findById(teamId);
  if (!team || team.isDeleted) {
    throw new ApiError(404, "Team not found");
  }

  if (team.teamLeader.toString() !== requesterId.toString()) {
    throw new ApiError(403, "Only team leader can remove members");
  }

  team.teamMembers = team.teamMembers.filter(
    (id) => id.toString() !== memberId,
  );

  await team.save();

  res.status(200).json({
    success: true,
    message: "Member removed successfully",
    data: team,
  });
};

/* ================= GET MY TEAMS ================= */
export const getMyTeams = async (req, res) => {
  const userId = req.user._id;

  const teams = await Team.find({
    isDeleted: false,
    $or: [
      { teamLeader: userId },
      { teamMembers: userId },
    ],
  })
    .populate("teamLeader", "name userId")
    .populate("teamMembers", "name userId");

  res.status(200).json({
    success: true,
    count: teams.length,
    data: teams,
  });
};

/* ================= GET TEAM BY ID ================= */
export const getTeamById = async (req, res) => {
  const { id } = req.params;

  const team = await Team.findById(id)
    .populate("teamLeader", "name userId")
    .populate("teamMembers", "name userId");

  if (!team || team.isDeleted) {
    throw new ApiError(404, "Team not found");
  }

  res.status(200).json({
    success: true,
    data: team,
  });
};

/* ================= DELETE TEAM ================= */
export const deleteTeam = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const team = await Team.findById(id);
  if (!team || team.isDeleted) {
    throw new ApiError(404, "Team not found");
  }

  if (team.teamLeader.toString() !== userId.toString()) {
    throw new ApiError(403, "Only team leader can delete the team");
  }

  team.isDeleted = true;
  await team.save();

  res.status(200).json({
    success: true,
    message: "Team deleted successfully",
  });
};

// src/controllers/registrationController.js
import { Registration } from "../models/registerations.model.js";
import { Event } from "../models/events.model.js";
import { Team } from "../models/team.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logAudit } from "../utils/auditLogger.js";

/* ================= REGISTER FOR EVENT ================= */
export const registerForEvent = async (req, res) => {
  const { eventId, teamId, formData } = req.body;
  const userId = req.user._id;

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  const event = await Event.findById(eventId);
  if (!event || event.isDeleted) {
    throw new ApiError(404, "Event not found");
  }

  // registration deadline check
  if (new Date() > new Date(event.registrationDeadline)) {
    throw new ApiError(400, "Registration deadline has passed");
  }

  // SOLO EVENT
  if (event.eventType === "solo") {
    const existing = await Registration.findOne({
      eventId,
      userId,
      isDeleted: false,
    });

    if (existing) {
      throw new ApiError(409, "Already registered for this event");
    }

    const registration = await Registration.create({
      eventId,
      userId,
      registeredBy: userId,
      formData,
    });

    // AUDIT LOG (USER)
    await logAudit({
      req,
      action: "REGISTRATION_CREATED",
      targetCollection: "Registration",
      targetId: registration._id,
      newData: registration,
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: registration,
    });
  }

  // TEAM / DUO EVENT
  if (!teamId) {
    throw new ApiError(400, "Team ID is required for team events");
  }

  const team = await Team.findById(teamId);
  if (!team || team.isDeleted) {
    throw new ApiError(404, "Team not found");
  }

  const isMember =
    team.teamLeader.toString() === userId.toString() ||
    team.teamMembers.some(
      (member) => member.toString() === userId.toString(),
    );

  if (!isMember) {
    throw new ApiError(403, "You are not a member of this team");
  }

  const teamSize = 1 + team.teamMembers.length;
  if (
    teamSize < event.teamSize.min ||
    teamSize > event.teamSize.max
  ) {
    throw new ApiError(
      400,
      `Team size must be between ${event.teamSize.min} and ${event.teamSize.max}`,
    );
  }

  const existingTeamReg = await Registration.findOne({
    eventId,
    teamId,
    isDeleted: false,
  });

  if (existingTeamReg) {
    throw new ApiError(409, "This team is already registered");
  }

  const registration = await Registration.create({
    eventId,
    teamId,
    registeredBy: userId,
    formData,
  });

  // AUDIT LOG (USER)
  await logAudit({
    req,
    action: "REGISTRATION_CREATED",
    targetCollection: "Registration",
    targetId: registration._id,
    newData: registration,
  });

  res.status(201).json({
    success: true,
    message: "Team registered successfully",
    data: registration,
  });
};

/* ================= GET MY REGISTRATIONS ================= */
export const getMyRegistrations = async (req, res) => {
  const userId = req.user._id;

  const registrations = await Registration.find({
    registeredBy: userId,
    isDeleted: false,
  })
    .populate({
      path: "eventId",
      select: "title startTime venueName images eventType category fee",
      populate: {
        path: "category",
        select: "name image icon", // jo bhi fields chahiye
      },
    })
    .populate("teamId", "teamName");

  res.status(200).json({
    success: true,
    count: registrations.length,
    data: registrations,
  });
};


/* ================= GET EVENT REGISTRATIONS (ADMIN) ================= */
export const getEventRegistrations = async (req, res) => {
  const { eventId } = req.params;

  const registrations = await Registration.find({
    eventId,
    isDeleted: false,
  })
    .populate("userId", "name userId email")
    .populate("teamId", "teamName")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: registrations.length,
    data: registrations,
  });
};

/* ================= CANCEL REGISTRATION ================= */
export const cancelRegistration = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const registration = await Registration.findById(id);
  if (!registration || registration.isDeleted) {
    throw new ApiError(404, "Registration not found");
  }

  if (registration.registeredBy.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized to cancel this registration");
  }

  // capture old state
  const oldData = registration.toObject();

  registration.status = "cancelled";
  registration.isDeleted = true;
  await registration.save();

  // AUDIT LOG (USER)
  await logAudit({
    req,
    action: "REGISTRATION_CANCELLED",
    targetCollection: "Registration",
    targetId: registration._id,
    oldData,
    newData: registration,
  });

  res.status(200).json({
    success: true,
    message: "Registration cancelled successfully",
  });
};/* ================= RESTORE REGISTRATION ================= */
export const restoreRegistration = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { teamId } = req.body;

  // Find the soft-deleted registration
  const registration = await Registration.findOne({
    _id: id,
    registeredBy: userId, // Use registeredBy instead of userId
    isDeleted: true,
  });

  if (!registration) {
    throw new ApiError(404, "Registration not found or cannot be restored");
  }

  // Check event details
  const event = await Event.findById(registration.eventId);
  if (!event || event.isDeleted) {
    throw new ApiError(404, "Event not found");
  }

  // Check registration deadline
  if (new Date() > new Date(event.registrationDeadline)) {
    throw new ApiError(400, "Registration deadline has passed");
  }

  // Check event capacity
  const activeRegistrations = await Registration.countDocuments({
    eventId: event._id,
    isDeleted: false,
    status: { $ne: "cancelled" },
  });

  if (activeRegistrations >= event.capacity) {
    throw new ApiError(400, "Event is now full");
  }

  // For team events, validate team
  if (event.eventType !== "solo") {
    if (!teamId) {
      throw new ApiError(400, "Team ID is required for team events");
    }

    const team = await Team.findById(teamId);
    if (!team || team.isDeleted) {
      throw new ApiError(404, "Team not found");
    }

    // Check if user is member of the team
    const isMember =
      team.teamLeader.toString() === userId.toString() ||
      team.teamMembers.some((member) => member.toString() === userId.toString());

    if (!isMember) {
      throw new ApiError(403, "You are not a member of this team");
    }

    // Check team size constraints
    const teamSize = 1 + team.teamMembers.length;
    if (teamSize < event.teamSize.min || teamSize > event.teamSize.max) {
      throw new ApiError(
        400,
        `Team size must be between ${event.teamSize.min} and ${event.teamSize.max}`
      );
    }

    // Check if team is already registered for this event
    const existingTeamReg = await Registration.findOne({
      eventId: event._id,
      teamId,
      isDeleted: false,
    });

    if (existingTeamReg) {
      throw new ApiError(409, "This team is already registered for the event");
    }

    registration.teamId = teamId;
  }

  // Capture old data for audit log
  const oldData = registration.toObject();

  // Restore the registration
  registration.isDeleted = false;
  registration.status = "pending";
  await registration.save();

  // AUDIT LOG
  await logAudit({
    req,
    action: "REGISTRATION_RESTORED",
    targetCollection: "Registration",
    targetId: registration._id,
    oldData,
    newData: registration,
  });

  res.status(200).json({
    success: true,
    message: "Registration restored successfully",
    data: registration,
  });
};

/* ================= GET ALL REGISTRATIONS (ADMIN) ================= */
export const getAllRegistrationsAdmin = async (req, res) => {
  const { type } = req.query;

  let filter = { isDeleted: false };

if (type === "solo") {
  filter.$or = [
    { teamId: null },
    { teamId: { $exists: false } }
  ];
}

if (type === "team") {
  filter.teamId = { $ne: null };
}


  const registrations = await Registration.find(filter)
    .populate({
      path: "eventId",
      select: "title fee",
    })
    .populate({
      path: "userId",
      select: "userId name email mobile_no",
    })
    .populate({
      path: "teamId",
      populate: [
        {
          path: "teamLeader",
          select: "userId name",
        },
        {
          path: "teamMembers",
          select: "name",
        },
      ],
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: registrations.length,
    data: registrations,
  });
};


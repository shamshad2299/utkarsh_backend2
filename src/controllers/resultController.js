// src/controllers/resultController.js
import { Result } from "../models/results.model.js";
import { Event } from "../models/events.model.js";
import { Registration } from "../models/registerations.model.js";
import { ApiError } from "../utils/ApiError.js";
import { logAudit } from "../utils/auditLogger.js";

/* ================= ADD RESULT (ADMIN) ================= */
export const addResult = async (req, res) => {
  const { eventId, registrationId, position } = req.body;

  if (!eventId || !registrationId || !position) {
    throw new ApiError(400, "Event, registration and position are required");
  }

  const event = await Event.findById(eventId);
  if (!event || event.isDeleted) {
    throw new ApiError(404, "Event not found");
  }

  if (event.resultsLocked) {
    throw new ApiError(403, "Results are locked for this event");
  }

  const registration = await Registration.findById(registrationId);
  if (!registration || registration.isDeleted) {
    throw new ApiError(404, "Registration not found");
  }

  if (registration.eventId.toString() !== eventId) {
    throw new ApiError(400, "Registration does not belong to this event");
  }

  const result = await Result.create({
    eventId,
    registrationId,
    position,
  });

  // AUDIT LOG (ADMIN)
  await logAudit({
    req,
    action: "RESULT_CREATED",
    targetCollection: "Result",
    targetId: result._id,
    newData: result,
  });

  res.status(201).json({
    success: true,
    message: "Result added successfully",
    data: result,
  });
};

/* ================= GET RESULTS BY EVENT ================= */
export const getResultsByEvent = async (req, res) => {
  const { eventId } = req.params;

  const results = await Result.find({ eventId })
    .populate({
      path: "registrationId",
      populate: [
        { path: "userId", select: "name userId" },
        { path: "teamId", select: "teamName" },
      ],
    })
    .sort({ position: 1 });

  res.status(200).json({
    success: true,
    count: results.length,
    data: results,
  });
};

/* ================= LOCK RESULTS (ADMIN) ================= */
export const lockResults = async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event || event.isDeleted) {
    throw new ApiError(404, "Event not found");
  }

  if (event.resultsLocked) {
    throw new ApiError(400, "Results already locked");
  }

  // capture old state
  const oldData = event.toObject();

  event.resultsLocked = true;
  await event.save();

  // AUDIT LOG (ADMIN)
  await logAudit({
    req,
    action: "RESULTS_LOCKED",
    targetCollection: "Event",
    targetId: event._id,
    oldData,
    newData: event,
  });

  res.status(200).json({
    success: true,
    message: "Results locked successfully",
  });
};

/* ================= DELETE RESULT (ADMIN) ================= */
export const deleteResult = async (req, res) => {
  const { id } = req.params;

  const result = await Result.findById(id);
  if (!result) {
    throw new ApiError(404, "Result not found");
  }

  const event = await Event.findById(result.eventId);
  if (event.resultsLocked) {
    throw new ApiError(403, "Cannot delete result after locking");
  }

  // capture old state
  const oldData = result.toObject();

  await result.deleteOne();

  // AUDIT LOG (ADMIN)
  await logAudit({
    req,
    action: "RESULT_DELETED",
    targetCollection: "Result",
    targetId: result._id,
    oldData,
  });

  res.status(200).json({
    success: true,
    message: "Result deleted successfully",
  });
};

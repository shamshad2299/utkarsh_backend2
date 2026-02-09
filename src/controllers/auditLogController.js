// src/controllers/auditLogController.js
import { AuditLog } from "../models/audit_logs.model.js";

/* ================= GET ALL AUDIT LOGS (ADMIN) ================= */
export const getAuditLogs = async (req, res) => {
  const {
    performedByModel, // "Admin" | "User"
    action,
    targetCollection,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};

  if (performedByModel) {
    filter.performedByModel = performedByModel;
  }

  if (action) {
    filter.action = action;
  }

  if (targetCollection) {
    filter.targetCollection = targetCollection;
  }

  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("performedBy", "name email userId")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit)),

    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

/* ================= GET AUDIT LOGS BY TARGET ================= */
export const getAuditLogsByTarget = async (req, res) => {
  const { collection, id } = req.params;

  const logs = await AuditLog.find({
    targetCollection: collection,
    targetId: id,
  })
    .populate("performedBy", "name email userId")
    .sort({ timestamp: -1 });

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
};

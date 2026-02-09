// src/utils/auditLogger.js
import { AuditLog } from "../models/audit_logs.model.js";

export const logAudit = async ({
  req,
  action,
  targetCollection,
  targetId,
  oldData = null,
  newData = null,
  session = null,
}) => {
  try {
    let performedBy;
    let performedByModel;

    if (req.admin) {
      performedBy = req.admin._id;
      performedByModel = "Admin";
    } else if (req.user) {
      performedBy = req.user._id;
      performedByModel = "User";
    } else {
      return; 
    }

    const auditPayload = {
      action,
      performedBy,
      performedByModel,
      targetCollection,
      targetId,
      oldData,
      newData,
    };

    if (session) {
      await AuditLog.create([auditPayload], { session });
    } else {
      await AuditLog.create(auditPayload);
    }
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};

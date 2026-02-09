// src/models/audit_logs.model.js
import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  action: { type: String, required: true },

  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "performedByModel",
  },

  performedByModel: {
    type: String,
    enum: ["User", "Admin"],
    required: true,
  },

  targetCollection: String,
  targetId: mongoose.Schema.Types.ObjectId,

  oldData: mongoose.Schema.Types.Mixed,
  newData: mongoose.Schema.Types.Mixed,

  timestamp: { type: Date, default: Date.now, index: true },
});

export const AuditLog = mongoose.model("AuditLog", auditSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Audit log for org/user actions.
// Keep this generic: store action + actor + target + metadata.
const ActivityLogSchema = new Schema(
  {
    action: { type: String, required: true, index: true },

    // Who performed the action (Clerk user id).
    actor_user_id: { type: String, required: true, index: true },

    // Which org the action pertains to (Clerk org id), if applicable.
    organization_id: { type: String, default: null, index: true },

    // Optional target user/org for delegation/security events.
    target_user_id: { type: String, default: null, index: true },
    target_organization_id: { type: String, default: null, index: true },

    // Optional role/permission label involved in the action.
    role: { type: String, default: null },

    // Request context (useful for incident review).
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },

    // Flexible payload for details (e.g. inviteEmail, roleAssigned, etc.).
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);
module.exports = ActivityLog;
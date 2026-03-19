import mongoose from "mongoose";
const { Schema } = mongoose;

const OrgLimitSchema = new Schema({
  user_id: { type: String, default: null, index: true },
  organization_id: { type: String, default: null, index: true },

  // Kept for backwards compatibility with the old schema.
  count: { type: Number, default: 0 },

  // General-purpose usage tracking fields.
  usage: { type: Number, default: 0 },
  limit: { type: Number, default: 0 },
  resetAt: { type: Date, default: null },

  // Example: "monthly", "daily", etc.
  period: { type: String, default: "monthly" },
}, { timestamps: true });

const OrgLimit = mongoose.model("OrgLimit", OrgLimitSchema);

export default OrgLimit;
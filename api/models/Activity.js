const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActivityLogSchema = new Schema({
  user_id: { type: String, required: true },
  organization_id: { type: String, default: null },
  taskDescription: { type: String, required: true }
},{ timestamps: true });

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
module.exports = ActivityLog;
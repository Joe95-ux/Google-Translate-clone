const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrgLimitSchema = new Schema({
  user_id: { type: String, required: true },
  organization_id: { type: String, default: null },
  count: { type: Number, default: 0 }
},{ timestamps: true });

const OrgLimit = mongoose.model('OrgLimit', OrgLimitSchema);
module.exports = OrgLimit;
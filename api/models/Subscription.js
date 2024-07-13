const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSubscriptionSchema = new Schema({
  user_id: { type: String, required: true },
  organization_id: { type: String, default: null },
  payment_status: { type: String, required: true },
  payment_id: { type: String, required: true },
  subExpiryDate: { type: Date, required: true }
});

const UserSubscription = mongoose.model('UserSubscription', UserSubscriptionSchema);
module.exports = UserSubscription;
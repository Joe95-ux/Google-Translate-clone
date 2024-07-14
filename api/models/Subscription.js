const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSubscriptionSchema = new Schema({
  user_id: { type: String, required: true },
  organization_id: { type: String, default: null },
 
  stripeCustomerId: { type: String, unique: true, required: true },
  stripeSubscriptionId: { type: String, unique: true, required: true },
  stripePriceId: { type: String, unique: true, required: true },
  stripeCurrentPeriodEnd: { type: Date, unique: true, required: true }
}, { timestamps: true });

const UserSubscription = mongoose.model('UserSubscription', UserSubscriptionSchema);
module.exports = UserSubscription;
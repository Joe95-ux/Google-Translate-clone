import mongoose from "mongoose";
const { Schema } = mongoose;

// Notes:
// - This schema supports both personal (user_id) and org (organization_id) subscriptions.
// - For org subscriptions, prefer setting `organization_id` and leaving `user_id` null.
const SubscriptionSchema = new Schema(
  {
    user_id: { type: String, default: null, index: true },
    organization_id: { type: String, default: null, index: true },

    // Stripe identifiers (optional because you might store subscription metadata
    // before connecting Stripe webhooks).
    stripeCustomerId: { type: String, unique: true, sparse: true, default: null },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    stripePriceId: { type: String, unique: true, sparse: true, default: null },
    stripeCurrentPeriodEnd: { type: Date, default: null },

    // Subscription state.
    status: {
      type: String,
      default: "active",
      enum: [
        "active",
        "trialing",
        "past_due",
        "incomplete",
        "canceled",
        "unpaid",
      ],
      index: true,
    },
    plan: { type: String, default: null, index: true },

    // Seats/limits for org delegation-style SaaS.
    seatLimit: { type: Number, default: 1 },
    seatCount: { type: Number, default: 1 },
    maxInvitesPerMonth: { type: Number, default: 100 },

    // Allow storing extra billing/feature metadata.
    features: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Ensure at least one of (user_id, organization_id) is set.
// This doesn't enforce during insert if your app doesn't provide both, but it documents intent.
SubscriptionSchema.index({ user_id: 1, organization_id: 1 });

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;
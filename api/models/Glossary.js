import mongoose from "mongoose";
const { Schema } = mongoose;

const GlossarySchema = new Schema(
  {
    organization_id: { type: String, required: true, index: true },
    created_by_user_id: { type: String, required: true, index: true },

    name: { type: String, required: true, index: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Glossary = mongoose.model("Glossary", GlossarySchema);

export default Glossary;


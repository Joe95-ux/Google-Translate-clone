import mongoose from "mongoose";
const { Schema } = mongoose;

const GlossaryEntrySchema = new Schema(
  {
    organization_id: { type: String, required: true, index: true },
    glossary_id: { type: Schema.Types.ObjectId, required: true, index: true },

    // Optional language context for future integration with translation.
    fromLanguage: { type: String, default: null },
    toLanguage: { type: String, default: null },

    sourceText: { type: String, required: true, index: true },
    targetText: { type: String, required: true },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

GlossaryEntrySchema.index(
  { organization_id: 1, glossary_id: 1, sourceText: 1, fromLanguage: 1, toLanguage: 1 },
  { unique: false }
);

const GlossaryEntry = mongoose.model("GlossaryEntry", GlossaryEntrySchema);

export default GlossaryEntry;


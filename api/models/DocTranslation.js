const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocTranslationSchema = new Schema({
  user_id: { type: String, required: true },
  organization_id: { type: String, default: null },
  fromLanguage: { type: String, required: true },
  toLanguage: { type: String, required: true },
  input_document_path: { type: String, required: true },
  output_document_path: { type: String, required: true }
},{ timestamps: true });

const DocTranslation = mongoose.model('DocTranslation', DocTranslationSchema);
module.exports = DocTranslation;